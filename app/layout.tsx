import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://permit-tracker-azure.vercel.app"),
  title: {
    default: "Permit Warden - Never miss a permit deadline",
    template: "%s | Permit Warden",
  },
  description:
    "Track permits, licenses, inspections, and renewal deadlines in one simple dashboard for small U.S. contractors.",
  keywords: [
    "permit tracker app",
    "construction permit management software",
    "building permit tracking software",
    "contractor permit tracking",
    "permit deadline tracking",
    "permit renewal reminders",
  ],
  authors: [{ name: "Permit Warden" }],
  creator: "Permit Warden",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Permit Warden",
    title: "Permit Warden - Never miss a permit deadline",
    description:
      "Permits, licenses, inspections, and renewal deadlines in one dashboard for small U.S. contractors.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Permit Warden - Never miss a permit deadline",
    description:
      "Permits, licenses, inspections, and renewal deadlines in one dashboard for small U.S. contractors.",
  },
  manifest: "/manifest.json",
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
