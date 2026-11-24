// Thin route: project logic lives in lib/features/projects.
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";
import {
  createProject,
  listProjects,
  updateProject,
} from "@/lib/features/projects";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { orgId } = await requireAuthOrg(supabase);
    return listProjects(supabase, orgId, new URL(request.url).searchParams);
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return createProject(supabase, orgId, user.id, body);
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return updateProject(supabase, orgId, user.id, body);
  });
}
