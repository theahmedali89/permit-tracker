// Thin route: organization-update logic lives in lib/features/settings.
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";
import { updateOrganization } from "@/lib/features/settings";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json();
    return updateOrganization(supabase, orgId, user.id, body);
  });
}
