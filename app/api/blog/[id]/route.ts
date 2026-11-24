import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/shared/platform-admin";
import { NextRequest, NextResponse } from "next/server";

async function requireMember() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  return membership ? supabase : null;
}

/**
 * Platform-admin gate for blog writes (2026-11-24) — see
 * app/api/blog/route.ts. PATCH/DELETE require a real platform admin;
 * unauthenticated → 401, non-admins → 403. GET is unchanged.
 */
async function requirePlatformAdmin(): Promise<
  { supabase: Awaited<ReturnType<typeof createClient>> } | { status: 401 | 403 }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 401 };
  if (!(await isPlatformAdmin(user.email))) return { status: 403 };
  return { supabase };
}

function adminError(status: 401 | 403) {
  return NextResponse.json(
    { error: status === 401 ? "Unauthorized" : "Forbidden: platform admins only" },
    { status }
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await requireMember();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformAdmin();
  if ("status" in auth) return adminError(auth.status);
  const supabase = auth.supabase;
  const { id } = await params;
  const body = await request.json();

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published, published_at")
    .eq("id", id)
    .single();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of ["title", "slug", "excerpt", "content", "meta_title", "meta_description"]) {
    if (body[key] !== undefined) updates[key] = body[key]?.trim() || null;
  }
  if (body.published !== undefined) {
    updates.published = !!body.published;
    if (body.published && !existing?.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase.from("blog_posts").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformAdmin();
  if ("status" in auth) return adminError(auth.status);
  const supabase = auth.supabase;
  const { id } = await params;
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
