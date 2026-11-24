// Thin route: sign-out logic lives in lib/features/auth.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/features/auth";

export async function POST() {
  const supabase = await createClient();
  redirect(await signOut(supabase));
}
