// Thin route: invite-accept logic lives in lib/features/team.
// The invite token is verified server-side; membership is inserted with
// the service-role client because the "add yourself to an org" RLS
// policy was deliberately removed (tenant-takeover risk).
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthUser } from "@/lib/shared/route-helpers";
import { acceptInvite } from "@/lib/features/team";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user } = await requireAuthUser(supabase);
    const body = await request.json().catch(() => null);
    const service = createServiceClient();
    return acceptInvite(service, user.id, user.email ?? undefined, body?.token);
  });
}
