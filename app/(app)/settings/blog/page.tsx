"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, Button, Input, Badge } from "@/components/ui";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  published: boolean;
  published_at: string | null;
  updated_at: string;
}

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  meta_title: "",
  meta_description: "",
  published: false,
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  async function load() {
    setLoadError("");
    try {
      const res = await fetch("/api/blog");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load (HTTP ${res.status})`);
      }
      const { posts } = await res.json();
      setPosts(posts || []);
    } catch (err: any) {
      setLoadError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function startEdit(id: string) {
    const res = await fetch(`/api/blog/${id}`);
    if (!res.ok) return;
    const { post } = await res.json();
    setEditing(id);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      published: !!post.published,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setEditing("new");
    setForm(EMPTY);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const url = editing === "new" ? "/api/blog" : `/api/blog/${editing}`;
      const res = await fetch(url, {
        method: editing === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Save failed");
      }
      setEditing(null);
      setForm(EMPTY);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    await load();
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Blog
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage articles published at /blog
          </p>
        </div>
        {!editing && <Button onClick={startNew}>New post</Button>}
      </div>

      {editing && (
        <Card className="p-6 mb-8">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            {editing === "new" ? "New post" : "Edit post"}
          </h2>
          {error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <Input value={form.title} onChange={set("title")} placeholder="Post title" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                <Input value={form.slug} onChange={set("slug")} placeholder="auto-from-title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
                <Input value={form.excerpt} onChange={set("excerpt")} placeholder="Short summary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content (Markdown)
              </label>
              <textarea
                value={form.content}
                onChange={set("content")}
                rows={16}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                placeholder="Write in Markdown..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta title</label>
                <Input value={form.meta_title} onChange={set("meta_title")} placeholder="Defaults to title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta description</label>
                <Input value={form.meta_description} onChange={set("meta_description")} placeholder="Defaults to excerpt" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded"
              />
              Published
            </label>
            <div className="flex gap-3">
              <Button onClick={save} disabled={saving || !form.title.trim() || !form.content.trim()}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => { setEditing(null); setForm(EMPTY); }}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {loadError && (
          <p className="p-6 text-sm text-red-600 dark:text-red-400">
            Couldn't load posts: {loadError}
          </p>
        )}
        {!loadError && posts.length === 0 && (
          <p className="p-6 text-sm text-gray-500 dark:text-gray-400 text-center">
            No posts yet.
          </p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white truncate">{p.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">/{p.slug}</p>
            </div>
            <Badge color={p.published ? "green" : "gray"}>
              {p.published ? "Published" : "Draft"}
            </Badge>
            <Button variant="secondary" onClick={() => startEdit(p.id)}>Edit</Button>
            <Button variant="danger" onClick={() => remove(p.id)}>Delete</Button>
          </div>
        ))}
      </Card>
    </AppShell>
  );
}
