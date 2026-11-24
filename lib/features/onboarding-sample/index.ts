/**
 * Onboarding sample data — one sample project + three sample permits so a
 * new org sees a working dashboard instead of an empty one.
 *
 * Everything is clearly labelled SAMPLE: permit numbers "SAMPLE-001"
 * etc., project name "Sample Project", fictional addresses in Austin, TX
 * (a city already in the regulation data). No real person or company
 * names are used anywhere.
 */
import { calculatePermitStatus } from "@/lib/shared/permit-status";

export const SAMPLE_PROJECT_NAME = "Sample Project";
export const SAMPLE_PERMIT_PREFIX = "SAMPLE-";

function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const SAMPLE_PERMITS = [
  {
    permit_number: "SAMPLE-001",
    permit_type: "Building",
    issuing_authority: "City of Austin",
    jurisdiction: "Austin, TX",
    issueDaysAgo: 30,
    expiresInDays: 150,
    renewalInDays: 120,
    notes: "Sample permit — created automatically so you can explore Permit Warden. Delete it any time from the dashboard.",
  },
  {
    permit_number: "SAMPLE-002",
    permit_type: "Electrical",
    issuing_authority: "City of Austin",
    jurisdiction: "Austin, TX",
    issueDaysAgo: 120,
    expiresInDays: 60,
    renewalInDays: 30,
    notes: "Sample permit — created automatically so you can explore Permit Warden. Delete it any time from the dashboard.",
  },
  {
    permit_number: "SAMPLE-003",
    permit_type: "Plumbing",
    issuing_authority: "City of Austin",
    jurisdiction: "Austin, TX",
    issueDaysAgo: 160,
    expiresInDays: 20,
    renewalInDays: 10,
    notes: "Sample permit — created automatically so you can explore Permit Warden. Delete it any time from the dashboard.",
  },
];

/**
 * Seed the sample project + permits for an org. `admin` is a service-role
 * client (onboarding runs through it). Idempotent: does nothing when the
 * org already has sample data.
 */
export async function seedSampleData(admin: any, orgId: string): Promise<{ projectId: string; permitIds: string[] }> {
  const { data: existing } = await admin
    .from("projects")
    .select("id")
    .eq("organization_id", orgId)
    .eq("name", SAMPLE_PROJECT_NAME)
    .limit(1);
  if (existing && existing.length > 0) {
    return { projectId: existing[0].id, permitIds: [] };
  }

  const { data: project, error: projectError } = await admin
    .from("projects")
    .insert({
      organization_id: orgId,
      name: SAMPLE_PROJECT_NAME,
      customer: "Sample Customer",
      address: "123 Congress Ave",
      city: "Austin",
      state: "TX",
      zip: "78701",
      project_type: "remodeling",
      status: "active",
      notes: "Sample project — created automatically so you can explore Permit Warden. Remove it from the dashboard.",
    })
    .select()
    .single();
  if (projectError || !project) throw new Error(projectError?.message ?? "Failed to create sample project");

  const permitIds: string[] = [];
  for (const s of SAMPLE_PERMITS) {
    const expiration_date = isoPlus(s.expiresInDays);
    const renewal_deadline = isoPlus(s.renewalInDays);
    const issue_date = isoPlus(-s.issueDaysAgo);
    const { data, error } = await admin
      .from("permits")
      .insert({
        organization_id: orgId,
        project_id: project.id,
        permit_type: s.permit_type,
        permit_number: s.permit_number,
        issuing_authority: s.issuing_authority,
        jurisdiction: s.jurisdiction,
        issue_date,
        expiration_date,
        renewal_deadline,
        status: calculatePermitStatus(expiration_date, renewal_deadline),
        notes: s.notes,
        source_type: "user_provided",
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create sample permit");
    permitIds.push(data.id);
    await admin.from("deadlines").insert({
      organization_id: orgId,
      resource_type: "permit",
      resource_id: data.id,
      deadline_type: "expiration",
      due_date: expiration_date,
    });
  }

  await admin.from("organizations").update({ sample_data: true }).eq("id", orgId);
  return { projectId: project.id, permitIds };
}

/**
 * Remove all sample data for an org: permits whose number starts with
 * SAMPLE-, their deadline rows, and the "Sample Project" project.
 * Scoped to the org — never touches real data.
 */
export async function removeSampleData(
  supabase: any,
  orgId: string
): Promise<{ permitsRemoved: number; projectsRemoved: number }> {
  const { data: permits } = await supabase
    .from("permits")
    .select("id")
    .eq("organization_id", orgId)
    .like("permit_number", `${SAMPLE_PERMIT_PREFIX}%`);
  const permitIds = (permits ?? []).map((p: any) => p.id);

  if (permitIds.length > 0) {
    await supabase
      .from("deadlines")
      .delete()
      .eq("organization_id", orgId)
      .eq("resource_type", "permit")
      .in("resource_id", permitIds);
    await supabase.from("permits").delete().eq("organization_id", orgId).in("id", permitIds);
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("organization_id", orgId)
    .eq("name", SAMPLE_PROJECT_NAME);
  const projectIds = (projects ?? []).map((p: any) => p.id);
  if (projectIds.length > 0) {
    await supabase.from("projects").delete().eq("organization_id", orgId).in("id", projectIds);
  }

  await supabase.from("organizations").update({ sample_data: false }).eq("id", orgId);
  return { permitsRemoved: permitIds.length, projectsRemoved: projectIds.length };
}
