// AES-256-GCM encryption for OAuth tokens at rest (Google Calendar
// access/refresh tokens). Uses Node's WebCrypto; the 32-byte key comes
// from the CALENDAR_TOKEN_KEY env var (base64). Format: base64(iv ||
// ciphertext) with a fresh 12-byte IV per encryption.
//
// Never log a plaintext or ciphertext token value.

function getKeyMaterial(): Buffer {
  const raw = process.env.CALENDAR_TOKEN_KEY;
  if (!raw) {
    throw new Error(
      "CALENDAR_TOKEN_KEY is not configured. Set it to a base64-encoded 32-byte key (generate with: openssl rand -base64 32)."
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("CALENDAR_TOKEN_KEY must be a base64-encoded 32-byte key.");
  }
  return key;
}

async function importKey(): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    "raw",
    getKeyMaterial() as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Encrypt `plaintext`; returns base64(iv || ciphertext). */
export async function encryptToken(plaintext: string): Promise<string> {
  const key = await importKey();
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return Buffer.from(combined).toString("base64");
}

/** Reverse of encryptToken. Throws on a bad key or corrupted value. */
export async function decryptToken(value: string): Promise<string> {
  const key = await importKey();
  const combined = Buffer.from(value, "base64");
  if (combined.length < 13) throw new Error("Invalid encrypted token value.");
  const iv = combined.subarray(0, 12);
  const ciphertext = combined.subarray(12);
  const plaintext = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );
  return new TextDecoder().decode(plaintext);
}

/** True when a usable CALENDAR_TOKEN_KEY is configured. */
export function isCalendarEncryptionConfigured(): boolean {
  try {
    getKeyMaterial();
    return true;
  } catch {
    return false;
  }
}
