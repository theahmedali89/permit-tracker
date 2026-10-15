import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import { complianceStatus } from "@/lib/subcontractor-compliance";
import Link from "next/link";
import { DocumentUploadForm, DeleteDocButton, InviteForm } from "./components";

function docTypeBadge(docType: string) {
  if (docType === "license") return <Badge color="blue">License</Badge>;
  if (docType === "coi") return <Badge color="green">COI</Badge>;
  return <Badge color="gray">Other</Badge>;
}

export default async function SubcontractorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) redirect("/onboarding");

  const { data: sub } = await supabase
    .from("subcontractors")
    .select("*")
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .single();
  if (!sub) notFound();

  const { data: docs } = await supabase
    .from("subcontractor_documents")
    .select("*")
    .eq("subcontractor_id", id)
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });

  const documents = docs || [];
  const comp = complianceStatus(sub, documents);

  const licenseDocs = documents.filter((d: any) => d.doc_type === "license");
  const coiDocs = documents.filter((d: any) => d.doc_type === "coi");
  const latestExpiry = (list: any[]) => {
    const dates = list.map((d) => d.expiration_date).filter(Boolean).sort();
    return dates.length ? dates[dates.length - 1] : null;
  };

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/subcontractors" className="text-sm text-blue-600 hover:text-blue-500">
          ← Back to Subcontractors
        </Link>
        <div className="flex justify-between items-start mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sub.name}</h1>
            {sub.trade && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{sub.trade}</p>
            )}
          </div>
          <Badge color={comp.color}>{comp.label}</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h2 className="font-semibold mb-3">Contact</h2>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {sub.email && <p>Email: {sub.email}</p>}
            {sub.phone && <p>Phone: {sub.phone}</p>}
            {sub.license_number && <p>License #: {sub.license_number}</p>}
            {sub.notes && <p className="pt-2">Notes: {sub.notes}</p>}
            {!sub.email && !sub.phone && <p>No contact info on file.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold mb-3">License & COI summary</h2>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>
              License expires:{" "}
              {latestExpiry(licenseDocs) || sub.license_expiration
                ? new Date(latestExpiry(licenseDocs) || sub.license_expiration).toLocaleDateString()
                : "—"}
              {licenseDocs.length > 0 && (
                <span className="text-xs"> ({licenseDocs.length} doc{licenseDocs.length > 1 ? "s" : ""})</span>
              )}
            </p>
            <p>
              COI expires:{" "}
              {latestExpiry(coiDocs) || sub.coi_expiration
                ? new Date(latestExpiry(coiDocs) || sub.coi_expiration).toLocaleDateString()
                : "—"}
              {coiDocs.length > 0 && (
                <span className="text-xs"> ({coiDocs.length} doc{coiDocs.length > 1 ? "s" : ""})</span>
              )}
            </p>
            <p className="pt-2">
              Status: <Badge color={comp.color}>{comp.label}</Badge>
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h2 className="font-semibold mb-3">Documents</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b">
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">File</th>
                  <th className="py-2 pr-4">Expires</th>
                  <th className="py-2 pr-4">Uploaded by</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc: any) => (
                  <tr key={doc.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{docTypeBadge(doc.doc_type)}</td>
                    <td className="py-2 pr-4">
                      <a
                        href={`/api/subcontractors/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {doc.file_name}
                      </a>
                      {doc.notes && (
                        <p className="text-xs text-gray-500">{doc.notes}</p>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {doc.expiration_date
                        ? new Date(doc.expiration_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 capitalize">{doc.uploaded_by}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <DeleteDocButton docId={doc.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <h3 className="font-medium text-sm mb-2">Upload a document</h3>
        <DocumentUploadForm subcontractorId={sub.id} />
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-1">Invite subcontractor to upload</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Send them a magic link — they can upload their license and COI without an account.
        </p>
        <InviteForm subcontractorId={sub.id} currentEmail={sub.email} />
      </Card>
    </AppShell>
  );
}
