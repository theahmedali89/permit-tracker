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
  metadataBase: new URL("https://permitwarden.com"),
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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden - Never miss a permit deadline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Permit Warden - Never miss a permit deadline",
    description:
      "Permits, licenses, inspections, and renewal deadlines in one dashboard for small U.S. contractors.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Permit Warden",
    url: "https://permitwarden.com",
    logo: "https://permitwarden.com/logo.png",
    description:
      "Permit, license, and inspection deadline tracking with automatic renewal reminders for small U.S. contractors.",
  };
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
