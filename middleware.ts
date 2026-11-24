import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// NOTE (Next.js 16): `middleware.ts` is deprecated in favour of
// `proxy.ts`, but this file is intentionally kept as `middleware.ts`
// for now — the auth/cookie handling here is unchanged and renaming
// is a separate migration. Revisit when upgrading past Next 16.

// Protected routes: every authenticated app section. Pages also guard
// themselves (see app/(app)/layout.tsx), this is defence in depth.
const protectedPaths = [
  "/dashboard",
  "/projects",
  "/permits",
  "/licenses",
  "/inspections",
  "/calendar",
  "/reports",
  "/directory",
  "/subcontractors",
  "/settings",
  "/onboarding",
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes: /dashboard, /projects, /permits, /licenses,
  // /inspections, /calendar, /reports, /directory, /subcontractors,
  // /settings, /onboarding
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/signin", "/signup"];
  const isAuthPage = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
