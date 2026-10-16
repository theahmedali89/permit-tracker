"use client";

import { useRef, useState } from "react";
import { Alert, Button } from "@/components/ui";

/**
 * PermitOcrUpload — scan a permit document photo/scan (JPG/PNG) and extract
 * candidate expiry dates + permit numbers to pre-fill the new-permit form.
 *
 * PRIVACY BY DESIGN:
 * - OCR runs entirely in the BROWSER via tesseract.js (dynamically imported so
 *   it never bloats the main bundle). The raw image is NEVER uploaded to a
 *   server, never persisted anywhere — it lives only in memory and an
 *   object URL that is revoked after processing.
 * - tesseract.js downloads its language model (eng.traineddata) from its CDN
 *   at runtime; only the model fetch leaves the browser, never the image.
 *
 * FUTURE: v1 supports images only. PDF support is a planned enhancement
 * (render pages to canvas, e.g. with pdf.js, then run the same OCR pass).
 */

export type OcrPrefill = {
  permit_number?: string;
  expiration_date?: string; // ISO YYYY-MM-DD
};

type DateCandidate = { raw: string; iso: string; labeled: boolean };
type ScanState = "idle" | "reading" | "ocr" | "done" | "error";

const MONTHS: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
  jan: "01", feb: "02", mar: "03", apr: "04", jun: "06", jul: "07", aug: "08",
  sep: "09", sept: "09", oct: "10", nov: "11", dec: "12",
};

const EXPIRY_LABEL = /expir(?:ation|y|es|ed)?|valid\s*(?:thru|through|until|to)|expire[sd]?\s*(?:on|date)?/i;
const PERMIT_LABEL = /permit\s*(?:no\.?|number|num|#)/i;

function pad(n: string | number) {
  return String(n).padStart(2, "0");
}

function toIso(month: string, day: string, year: string): string | null {
  let m = parseInt(month, 10);
  let d = parseInt(day, 10);
  let y = parseInt(year, 10);
  if (year.length === 2) y += y >= 70 ? 1900 : 2000;
  // MM/DD vs DD/MM ambiguity: if month slot > 12 and day slot <= 12, swap.
  if (m > 12 && d <= 12) [m, d] = [d, m];
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2200) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Extract candidate dates, preferring those near expiry labels. */
function extractDates(text: string): DateCandidate[] {
  const found = new Map<string, DateCandidate>();
  const add = (raw: string, iso: string | null, labeled: boolean) => {
    if (!iso || found.has(iso)) return;
    found.set(iso, { raw: raw.trim(), iso, labeled });
  };

  // Numeric: MM/DD/YYYY, MM-DD-YYYY, DD-MM-YYYY, YYYY-MM-DD
  const numeric = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b|\b(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/g;
  let m: RegExpExecArray | null;
  while ((m = numeric.exec(text))) {
    const raw = m[0];
    const window = text.slice(Math.max(0, m.index - 80), m.index);
    const labeled = EXPIRY_LABEL.test(window);
    if (m[4]) {
      add(raw, toIso(m[5], m[6], m[4]), labeled);
    } else {
      add(raw, toIso(m[1], m[2], m[3]), labeled);
    }
  }

  // Month-name: "January 5, 2027", "Jan 5 2027", "5 January 2027"
  const monthName = new RegExp(
    `\\b(${Object.keys(MONTHS).join("|")})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b` +
      `|\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${Object.keys(MONTHS).join("|")})\\.?\\s*,?\\s*(\\d{4})\\b`,
    "gi"
  );
  while ((m = monthName.exec(text))) {
    const raw = m[0];
    const window = text.slice(Math.max(0, m.index - 80), m.index);
    const labeled = EXPIRY_LABEL.test(window);
    if (m[1]) {
      add(raw, toIso(MONTHS[m[1].toLowerCase()], m[2], m[3]), labeled);
    } else {
      add(raw, toIso(MONTHS[m[5].toLowerCase()], m[4], m[6]), labeled);
    }
  }

  return [...found.values()]
    .sort((a, b) => Number(b.labeled) - Number(a.labeled))
    .slice(0, 5);
}

/** Extract candidate permit numbers, preferring those near "Permit No/#" labels. */
function extractPermitNumbers(text: string): string[] {
  const found: string[] = [];
  const add = (raw: string) => {
    const v = raw.replace(/\s+/g, " ").trim();
    // A real permit number almost always contains a digit; reject bare words.
    if (v.length >= 4 && v.length <= 30 && /\d/.test(v) && !found.includes(v)) found.push(v);
  };

  // Labeled: "Permit No: BLD-2026-08451" — capture the code after the label,
  // allowing one internal space/dash group ("ELEC 88412") but no trailing words.
  const labeled = new RegExp(`${PERMIT_LABEL.source}\\s*[:#\\-]?\\s*([A-Za-z0-9][A-Za-z0-9\\-/]*(?:[ \\-][A-Za-z0-9]+)?)`, "gi");
  let m: RegExpExecArray | null;
  while ((m = labeled.exec(text))) add(m[1]);

  // Standalone permit-style codes: letter prefix + digits, or digit-heavy codes.
  const code = /\b(?:[A-Z]{1,5}[- ]?\d{3,9}(?:[- ]\d{1,6})?|\d{4}[- ]\d{3,8})\b/g;
  while ((m = code.exec(text))) {
    const v = m[0].replace(/\s+/g, "").trim();
    if (!/^\d{1,4}$/.test(v)) add(v);
    if (found.length >= 5) break;
  }

  return found.slice(0, 5);
}

export default function PermitOcrUpload({ onExtract }: { onExtract: (v: OcrPrefill) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dates, setDates] = useState<DateCandidate[]>([]);
  const [numbers, setNumbers] = useState<string[]>([]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setDates([]);
    setNumbers([]);

    // v1: images only.
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setState("error");
      setError("Please choose a JPG or PNG image. PDF support is coming soon.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setState("error");
      setError("That image is larger than 15 MB. Please use a smaller photo or scan.");
      return;
    }

    setFileName(file.name);
    setState("reading");
    // Object URL lives in browser memory only; revoked after OCR. Nothing leaves the device.
    const url = URL.createObjectURL(file);

    try {
      // Dynamic import: tesseract.js + its worker are fetched only when the
      // user actually scans a document — never part of the main bundle.
      const Tesseract = (await import("tesseract.js")).default;
      setState("ocr");
      setProgress(0);
      const { data } = await Tesseract.recognize(url, "eng", {
        logger: (msg: any) => {
          if (msg?.status === "recognizing text" && typeof msg?.progress === "number") {
            setProgress(Math.round(msg.progress * 100));
          }
        },
      } as any);

      const text = (data?.text ?? "").trim();
      if (!text || text.length < 10) {
        throw new Error("No readable text was found in this image. Try a clearer photo with the document flat and well lit.");
      }

      const dateCandidates = extractDates(text);
      const numberCandidates = extractPermitNumbers(text);
      if (dateCandidates.length === 0 && numberCandidates.length === 0) {
        throw new Error("No dates or permit numbers could be recognized. Try a sharper image.");
      }
      setDates(dateCandidates);
      setNumbers(numberCandidates);
      setState("done");
    } catch (err: any) {
      setState("error");
      setError(err?.message ?? "Something went wrong while scanning the document. Please try again.");
    } finally {
      URL.revokeObjectURL(url);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function useDate(c: DateCandidate) {
    onExtract({ expiration_date: c.iso });
  }
  function useNumber(n: string) {
    onExtract({ permit_number: n });
  }

  return (
    <div className="mb-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
        aria-label="Scan permit document (JPG or PNG)"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={state === "reading" || state === "ocr"}
        >
          {state === "reading" || state === "ocr" ? "Scanning…" : "📄 Scan document"}
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upload a photo or scan of the permit (JPG/PNG). Text is read in your browser — the image is never uploaded or stored.
        </p>
      </div>

      {fileName && (state === "reading" || state === "ocr") && (
        <div className="mt-3" role="status" aria-live="polite">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            {state === "reading" ? "Reading image…" : `Recognizing text… ${progress}%`}
          </p>
          <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: state === "reading" ? "8%" : `${Math.max(progress, 8)}%` }}
            />
          </div>
        </div>
      )}

      {state === "error" && error && (
        <Alert type="error"><p>{error}</p></Alert>
      )}

      {state === "done" && (
        <div className="mt-4 space-y-4">
          {dates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry date candidates
              </h3>
              <ul className="space-y-1">
                {dates.map((c) => (
                  <li key={c.iso} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5">
                      Extracted from document
                    </span>
                    <span className="text-gray-900 dark:text-white font-mono">
                      {c.iso}
                      <span className="text-gray-500 dark:text-gray-400 font-sans"> (as printed: {c.raw})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => useDate(c)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Use this
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {numbers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permit number candidates
              </h3>
              <ul className="space-y-1">
                {numbers.map((n) => (
                  <li key={n} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5">
                      Extracted from document
                    </span>
                    <span className="text-gray-900 dark:text-white font-mono">{n}</span>
                    <button
                      type="button"
                      onClick={() => useNumber(n)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Use this
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Check the value before using it — OCR can misread characters. Everything stays editable until you save.
          </p>
        </div>
      )}
    </div>
  );
}
