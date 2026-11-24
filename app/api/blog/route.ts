import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/shared/platform-admin";
import { NextRequest, NextResponse } from "next/server";

async function requireMember() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  return membership ? supabase : null;
}

/**
 * Platform-admin gate for blog writes (2026-11-24): the changelog
 * claimed this check was enforced in app/api/blog/*, but the code only
 * checked org membership — any customer could attempt a write (blocked
 * only by RLS, and only if migration-security-fixes.sql has run).
 * Now POST/PATCH/DELETE require a real platform admin
 * (`PLATFORM_ADMIN_EMAILS` env or `platform_admins` table, via
 * `isPlatformAdmin()`); unauthenticated → 401, non-admins → 403.
 * GET is unchanged.
 */
async function requirePlatformAdmin(): Promise<
  { supabase: Awaited<ReturnType<typeof createClient>> } | { status: 401 | 403 }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 401 };
  if (!(await isPlatformAdmin(user.email))) return { status: 403 };
  return { supabase };
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function GET() {
  const supabase = await requireMember();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, published, published_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformAdmin();
  if ("status" in auth) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden: platform admins only" },
      { status: auth.status }
    );
  }
  const supabase = auth.supabase;
  const body = await request.json();
  const { title, slug, excerpt, content, published, meta_title, meta_description } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }
  const finalSlug = slug?.trim() || slugify(title);
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      slug: finalSlug,
      title: title.trim(),
      excerpt: (excerpt || "").trim() || title.trim().slice(0, 160),
      content,
      published: !!published,
      published_at: published ? new Date().toISOString() : null,
      meta_title: meta_title?.trim() || null,
      meta_description: meta_description?.trim() || null,
    })
    .select("id, slug")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}
