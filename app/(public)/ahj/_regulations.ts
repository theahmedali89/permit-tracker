/**
 * Thin re-export shim — the regulation data now lives in
 * `lib/shared/jurisdiction-data.ts` (modularity fix 2026-11-24: features
 * must not import data from a public page file). Kept so every existing
 * import (`app/(public)/ahj/[state]/[city]/page.tsx`, `app/sitemap.ts`,
 * `components/permit-ocr-upload.tsx`, …) keeps working unchanged.
 * New code should import from `@/lib/shared/jurisdiction-data` directly.
 */
export * from "@/lib/shared/jurisdiction-data";
