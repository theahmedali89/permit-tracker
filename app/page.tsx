import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "./(public)/_components/LandingPage";

const PAGE_URL = "https://permitwarden.com/";

export const metadata: Metadata = {
  title: "Permit Warden — never miss a permit deadline again",
  description:
    "Permit Warden tracks your permits, licenses, inspections, and subcontractor insurance — and emails you before they expire. Free to start, built for small U.S. contractors.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Permit Warden — never miss a permit deadline again",
    description:
      "Automatic email reminders before permits, licenses, and inspections expire. 186 AHJ portals across all 50 states. Free to start.",
    url: PAGE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden - permit deadline tracking for contractors",
      },
    ],
  },
};

const WEBPAGE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Permit Warden — never miss a permit deadline again",
  description:
    "Permit, license, and inspection deadline tracking with automatic email reminders for small U.S. contractors.",
  url: PAGE_URL,
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged-in users go straight to the app; everyone else gets the marketing page.
  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_JSON_LD) }}
      />
      <LandingPage />
    </>
  );
}
