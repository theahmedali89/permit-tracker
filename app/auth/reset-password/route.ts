// Thin route: password-reset logic lives in lib/features/auth.
import { createClient } from "@/lib/supabase/server";
import { getClientIp, rateLimitResponse } from "@/lib/shared/rate-limit";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { AuthRateLimitedError, requestPasswordReset } from "@/lib/features/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  const supabase = await createClient();
  let redirectTo: string;
  try {
    redirectTo = await requestPasswordReset(supabase, getClientIp(request), email);
  } catch (err) {
    if (err instanceof AuthRateLimitedError) {
      return rateLimitResponse(err.retryAfterSeconds);
    }
    throw err;
  }
  redirect(redirectTo);
}
