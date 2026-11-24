// Thin route: sign-up logic lives in lib/features/auth.
import { createClient } from "@/lib/supabase/server";
import { getClientIp, rateLimitResponse } from "@/lib/shared/rate-limit";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { AuthRateLimitedError, signUp } from "@/lib/features/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  let redirectTo: string;
  try {
    redirectTo = await signUp(supabase, getClientIp(request), email, password);
  } catch (err) {
    if (err instanceof AuthRateLimitedError) {
      return rateLimitResponse(err.retryAfterSeconds);
    }
    throw err;
  }
  redirect(redirectTo);
}
