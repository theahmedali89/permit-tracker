import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// POST /api/subcontractors/[id]/invite — body { email }: create magic-link invite + email it
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { data: sub } = await supabase
    .from("subcontractors")
    .select("id, name, trade, organizations(name)")
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .single();
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Replace any still-active invite for this subcontractor so only one link works
  await supabase
    .from("subcontractor_invites")
    .delete()
    .eq("subcontractor_id", id)
    .is("used_at", null);

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("subcontractor_invites").insert({
    organization_id: membership.organization_id,
    subcontractor_id: id,
    email,
    token,
    expires_at: expiresAt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orgName = (sub as any).organizations?.name || "Your contractor";
  const link = `${request.nextUrl.origin}/portal/sub/${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `${orgName}: Upload your license & insurance documents`,
      html: `
        <h2>Document upload request</h2>
        <p><strong>${orgName}</strong> is asking you (${sub.name}${sub.trade ? ` — ${sub.trade}` : ""})
        to upload your current <strong>license</strong> and <strong>certificate of insurance (COI)</strong>.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Upload documents</a></p>
        <p>Or copy this link: <a href="${link}">${link}</a></p>
        <p>This link expires in 7 days. No account needed.</p>
      `,
    });
  } catch (err: any) {
    // Invite row exists even if the email fails — contractor can copy the link manually
    console.error("Invite email failed:", err.message);
    return NextResponse.json({ ok: true, token, link, emailSent: false });
  }

  await supabase.from("audit_events").insert({
    organization_id: membership.organization_id,
    actor_id: user.id,
    action: "subcontractor_invite.sent",
    entity_type: "subcontractor",
    entity_id: id,
  });

  return NextResponse.json({ ok: true, token, link, emailSent: true });
}
