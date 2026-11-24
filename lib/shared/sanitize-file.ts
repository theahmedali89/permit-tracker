// File-name sanitising + magic-byte (content sniffing) checks for uploads.
// Client-supplied `file.type` / `file.name` are never trusted: the stored
// name is a fresh UUID plus an allow-listed extension, and the first bytes
// of the file must match the claimed type.

import { randomUUID } from "crypto";

export const ALLOWED_UPLOAD_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"] as const;
export type AllowedUploadExtension = (typeof ALLOWED_UPLOAD_EXTENSIONS)[number];

const MAGIC_BYTES: Record<AllowedUploadExtension, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  jpg: [[0xff, 0xd8, 0xff]], // FF D8 FF
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], // 89 50 4E 47 ...
};

/**
 * Strip any path/traversal from a client-supplied file name and return a
 * safe storage name: `<uuid>.<allow-listed extension>`.
 * Throws when the extension is not allow-listed.
 */
export function sanitizeFileName(originalName: string): string {
  // Strip directory components (both separators) and null bytes.
  const base = String(originalName ?? "")
    .replace(/\0/g, "")
    .split(/[\\/]/)
    .pop()!
    .trim();
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) {
    throw new Error("File must have an allowed extension (pdf, jpg, png).");
  }
  const ext = base.slice(dot + 1).toLowerCase();
  if (!(ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)) {
    throw new Error(`File type .${ext} is not allowed. Only PDF, JPG, PNG allowed.`);
  }
  return `${randomUUID()}.${ext}`;
}

/** Detect the real type of a file from its first bytes, or null if unknown. */
export function detectFileTypeFromBytes(bytes: Uint8Array): AllowedUploadExtension | null {
  for (const ext of ALLOWED_UPLOAD_EXTENSIONS) {
    for (const magic of MAGIC_BYTES[ext]) {
      if (magic.every((b, i) => bytes[i] === b)) return ext;
    }
  }
  return null;
}

/**
 * Verify the first bytes of `file` match `expected` (pdf | jpg | png).
 * Returns false (never throws) when the bytes do not match.
 */
export async function checkMagicBytes(
  file: Blob,
  expected: AllowedUploadExtension
): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const detected = detectFileTypeFromBytes(head);
  if (!detected) return false;
  // jpg and jpeg share a signature; treat them as the same type.
  if ((expected === "jpg" || expected === "jpeg") && (detected === "jpg" || detected === "jpeg")) {
    return true;
  }
  return detected === expected;
}

/** Map a MIME type to its allow-listed extension, or null if not allowed. */
export function extensionForMimeType(mimeType: string): AllowedUploadExtension | null {
  switch (mimeType.toLowerCase()) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return null;
  }
}
