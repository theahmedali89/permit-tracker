import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
import InviteForm from "./invite-form";
import TeamActions from "./team-actions";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const { data: members } = await supabase
    .from("organization_members")
    .select("id, role, created_at, user_id")
    .eq("organization_id", membership.organization_id)
    .order("created_at");

  const { data: invites } = await supabase
    .from("team_invites")
    .select("id, email, role, status, expires_at, created_at")
    .eq("organization_id", membership.organization_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const canManage = ["owner", "admin"].includes(membership.role);
  const roleColor = (r: string) =>
    r === "owner" ? "blue" : r === "admin" ? "green" : "gray";

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/settings" className="text-sm text-blue-600 hover:text-blue-500">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Team</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage who has access to your company workspace.
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Members ({members?.length || 0})
          </h2>
          <div className="space-y-3">
            {(members || []).map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {m.user_id === user.id ? "You" : `Member ${m.user_id.slice(0, 8)}…`}
                    {m.user_id === user.id && (
                      <span className="ml-2 text-xs text-gray-500">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={roleColor(m.role)}>{m.role}</Badge>
                  {canManage && m.user_id !== user.id && (
                    <TeamActions memberId={m.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {invites && invites.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pending Invites ({invites.length})
            </h2>
            <div className="space-y-3">
              {invites.map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.email}</p>
                    <p className="text-xs text-gray-500">
                      Invited {new Date(inv.created_at).toLocaleDateString()} · expires{" "}
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={roleColor(inv.role)}>{inv.role}</Badge>
                    {canManage && <TeamActions inviteId={inv.id} />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {canManage ? (
          <InviteForm />
        ) : (
          <Card className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Only owners and admins can invite team members.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
