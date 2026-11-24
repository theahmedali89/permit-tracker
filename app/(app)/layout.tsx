// App-section layout guard: every page under app/(app) requires a
// signed-in user. Middleware also protects these paths (defence in
// depth); this guard is the one that runs even if middleware is skipped.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  return <>{children}</>;
}
