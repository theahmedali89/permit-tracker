// Thin route: the reminder engine lives in
// lib/features/reminders/run-reminder-cron.ts. This handler only checks
// the feature flag + CRON_SECRET, builds the clients, and returns the
// engine's result. Behaviour unchanged (see the feature module).

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import {
  FeatureDisabledError,
  requireFeatureEnabled,
} from "@/lib/features/registry";
import { runFeature, result } from "@/lib/shared/http";
import { runReminderCron } from "@/lib/features/reminders/run-reminder-cron";

// Daily reminder cron can fan out to many orgs; give it the full window.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  try {
    requireFeatureEnabled("reminders");
  } catch (err) {
    if (err instanceof FeatureDisabledError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role for background processing (created inside handler)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  return runFeature(async () =>
    result(
      200,
      await runReminderCron({
        supabase,
        resend,
        fromEmail: process.env.RESEND_FROM_EMAIL!,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
      })
    )
  );
}
