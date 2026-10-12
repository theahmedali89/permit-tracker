import { createClient } from "@/lib/supabase/server";

import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui";
import Link from "next/link";

export default async function ProjectsPage() {
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

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <Link href="/projects/new">
          <Button>Add Project</Button>
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add your first project to start tracking permits and deadlines.
          </p>
          <Link href="/projects/new">
            <Button>Add Project</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {project.name}
                </h3>
                {project.customer && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{project.customer}</p>
                )}
                {project.city && project.state && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {project.city}, {project.state}
                  </p>
                )}
                <div className="mt-2">
                  <Badge color={project.status === "active" ? "green" : "gray"}>
                    {project.status}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
