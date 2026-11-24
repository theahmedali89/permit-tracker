// Thin route: OAuth callback logic lives in lib/features/auth.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { exchangeCodeForSession } from "@/lib/features/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();
  const redirectTo = await exchangeCodeForSession(supabase, code, next);
  redirect(redirectTo);
}
