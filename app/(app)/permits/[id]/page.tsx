import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
import { DocumentUpload } from "./upload";
import { DeadlineAdd } from "./deadline-add";

export default async function PermitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: permit } = await supabase
    .from("permits")
    .select("*, projects(name)")
    .eq("id", id)
    .single();

  if (!permit) notFound();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("permit_id", id)
    .order("created_at", { ascending: false });

  const { data: deadlines } = await supabase
    .from("deadlines")
    .select("*")
    .eq("resource_type", "permit")
    .eq("resource_id", id)
    .order("due_date");

  return (
    <AppShell>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link href="/permits" className="text-sm text-blue-600 hover:text-blue-500">
            ← Back to Permits
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {permit.permit_type}
            {permit.permit_number && ` - ${permit.permit_number}`}
          </h1>
        </div>
        <Link
          href={`/permits/${id}/edit`}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Edit Permit
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
              <dd><Badge color={permit.status === "active" ? "green" : permit.status === "expired" ? "red" : "yellow"}>{permit.status}</Badge></dd>
            </div>
            {permit.projects && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Project</dt>
                <dd className="text-sm font-medium">{permit.projects.name}</dd>
              </div>
            )}
            {permit.issuing_authority && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Authority</dt>
                <dd className="text-sm">{permit.issuing_authority}</dd>
              </div>
            )}
            {permit.expiration_date && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Expires</dt>
                <dd className="text-sm">{new Date(permit.expiration_date).toLocaleDateString()}</dd>
              </div>
            )}
            {permit.renewal_url ? (
              <div className="flex justify-between items-center">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Renewal</dt>
                <dd>
                  <a
                    href={permit.renewal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Renew online ↗
                  </a>
                </dd>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Renewal</dt>
                <dd>
                  <Link href="/ahj" className="text-sm text-blue-600 hover:text-blue-500">
                    Find AHJ portal →
                  </Link>
                </dd>
              </div>
            )}
            {permit.notes && (
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</dt>
                <dd className="text-sm">{permit.notes}</dd>
              </div>
            )}
            {permit.custom_fields && Object.keys(permit.custom_fields).length > 0 && (
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">Custom Fields</dt>
                <dd className="space-y-1">
                  {Object.entries(permit.custom_fields).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{k}</span>
                      <span className="font-medium">{String(v)}</span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Deadlines</h2>
              <DeadlineAdd permitId={id} />
            </div>
            {!deadlines || deadlines.length === 0 ? (
              <p className="text-sm text-gray-500">No deadlines</p>
            ) : (
              <div className="space-y-2">
                {deadlines.map((d: any) => (
                  <div key={d.id} className="flex justify-between text-sm">
                    <span className="capitalize">{d.deadline_type}</span>
                    <span>{new Date(d.due_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Documents</h2>
              <DocumentUpload permitId={id} />
            </div>
            {!documents || documents.length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="text-sm">
                    📄 {doc.file_name}
                    <span className="text-gray-500 ml-2">
                      ({(doc.file_size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
