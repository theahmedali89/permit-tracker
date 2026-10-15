import { createServiceClient } from "@/lib/supabase/service";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { PortalUploadForm } from "./upload-form";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: invite } = await supabase
    .from("subcontractor_invites")
    .select(`
      id, email, expires_at, used_at,
      subcontractors!inner(name, trade),
      organizations!inner(name)
    `)
    .eq("token", token)
    .single();

  const valid =
    invite &&
    !invite.used_at &&
    new Date(invite.expires_at).getTime() > Date.now();

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link unavailable</h1>
          <p className="text-gray-600 text-sm">
            This upload link is invalid, has expired, or has been revoked.
            Please ask your contractor to send you a new one.
          </p>
        </Card>
      </div>
    );
  }

  if (!invite) notFound();

  const sub = (invite as any).subcontractors;
  const org = (invite as any).organizations;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="p-8 max-w-lg w-full">
        <p className="text-sm text-gray-500 mb-1">{org.name} is requesting documents</p>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Upload for {sub.name}
        </h1>
        {sub.trade && <p className="text-sm text-gray-500 mb-6">{sub.trade}</p>}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          Please upload your current <strong>license</strong> and{" "}
          <strong>certificate of insurance (COI)</strong>. No account needed —
          this link expires on {new Date(invite.expires_at).toLocaleDateString()}.
        </div>
        <PortalUploadForm token={token} />
      </Card>
    </div>
  );
}
