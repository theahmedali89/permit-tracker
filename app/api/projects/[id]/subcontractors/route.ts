import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId, verifyParentOrg } from "@/lib/shared/org-context";
import { parseLinkBody } from "@/lib/features/project-gate";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

async function getAuthedOrg() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  const orgId = await getActiveOrgId(supabase, user.id);
  if (!orgId) return { error: NextResponse.json({ error: "No organization" }, { status: 400 }) } as const;
  return { supabase, orgId, userId: user.id } as const;
}

/**
 * POST /api/projects/[id]/subcontractors — link a subcontractor to a
 * project (Project Gate). Both the project and the subcontractor must
 * belong to the caller's org, else 403. Duplicate link → 409.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: projectId } = await params;
  const authed = await getAuthedOrg();
  if ("error" in authed) return authed.error;
  const { supabase, orgId } = authed;

  if (!(await verifyParentOrg(supabase, "projects", projectId, orgId))) {
    return NextResponse.json({ error: "Project not found in this organization" }, { status: 403 });
  }

  const parsed = parseLinkBody(await request.json().catch(() => null));
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (!(await verifyParentOrg(supabase, "subcontractors", parsed.subcontractorId, orgId))) {
    return NextResponse.json({ error: "Subcontractor not found in this organization" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("project_subcontractors")
    .insert({
      organization_id: orgId,
      project_id: projectId,
      subcontractor_id: parsed.subcontractorId,
    })
    .select()
    .single();

  if (error) {
    // Unique (project_id, subcontractor_id) — already linked.
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Subcontractor is already linked to this project" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: authed.userId,
    action: "project.subcontractor_linked",
    entity_type: "project",
    entity_id: projectId,
  });

  return NextResponse.json(data, { status: 201 });
}

/**
 * DELETE /api/projects/[id]/subcontractors — unlink a subcontractor
 * from a project. Subcontractor id comes from the JSON body
 * ({ subcontractor_id }) or the ?subcontractor_id= query param.
 * Unlinking a sub that was never linked → 404.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: projectId } = await params;
  const authed = await getAuthedOrg();
  if ("error" in authed) return authed.error;
  const { supabase, orgId } = authed;

  if (!(await verifyParentOrg(supabase, "projects", projectId, orgId))) {
    return NextResponse.json({ error: "Project not found in this organization" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fromQuery = new URL(request.url).searchParams.get("subcontractor_id");
  const parsed = parseLinkBody(body ?? (fromQuery ? { subcontractor_id: fromQuery } : null));
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("project_subcontractors")
    .delete()
    .eq("organization_id", orgId)
    .eq("project_id", projectId)
    .eq("subcontractor_id", parsed.subcontractorId)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Subcontractor is not linked to this project" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
