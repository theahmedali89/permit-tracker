"use client";

import { useRef, useState } from "react";
import { Alert, Button } from "@/components/ui";

/**
 * PermitOcrUpload — scan a permit document photo/scan (JPG/PNG) or PDF and
 * extract candidate expiry dates + permit numbers to pre-fill the new-permit
 * form. PDFs are rendered to canvas pages with pdfjs-dist (dynamically
 * imported, client-side only) and each page runs the same Tesseract pass.
 *
 * PRIVACY BY DESIGN:
 * - OCR runs entirely in the BROWSER via tesseract.js (dynamically imported so
 *   it never bloats the main bundle). The raw image/PDF is NEVER uploaded to a
 *   server, never persisted anywhere — it lives only in memory and an
 *   object URL that is revoked after processing.
 * - tesseract.js downloads its language model (eng.traineddata) from its CDN
 *   at runtime, and pdf.js fetches its worker script from a CDN; only those
 *   code fetches leave the browser, never the document.
 *
 * NOTE (plans): AI-powered extraction is a Professional/Business plan
 * feature in lib/plans.ts (aiExtraction). This browser OCR is free for all
 * plans; the note below is UI-only and does not gate anything here.
 */

import { REGULATION_DATA } from "@/app/(public)/ahj/_regulations";

export type OcrPrefill = {
  permit_number?: string;
  expiration_date?: string; // ISO YYYY-MM-DD
  issue_date?: string; // ISO YYYY-MM-DD
  jurisdiction?: string; // e.g. "Austin, TX"
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
const ISSUE_LABEL = /issu(?:ed|e)?\s*(?:on|date)?|date\s*issued|issued/i;
const FEE_LABEL = /fee|amount\s*due|total\s*due|amount\s*paid|total/i;

/** One extracted field value with a heuristic confidence (0–100). */
export type FieldResult = {
  value: string;
  confidence: number;
  labeled: boolean;
  page: number;
};

function confidenceFor(ocrConfidence: number, labeled: boolean): number {
  const base = Math.round(ocrConfidence || 0);
  return Math.max(0, Math.min(100, labeled ? base : Math.round(base * 0.8)));
}

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

/** Extract an issue date: dates near an "issued" label (labeled only). */
function extractIssueDates(text: string): DateCandidate[] {
  const found = new Map<string, DateCandidate>();
  const numeric = /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b|\b(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/g;
  let m: RegExpExecArray | null;
  while ((m = numeric.exec(text))) {
    const window = text.slice(Math.max(0, m.index - 80), m.index);
    if (!ISSUE_LABEL.test(window)) continue;
    const iso = m[4] ? toIso(m[5], m[6], m[4]) : toIso(m[1], m[2], m[3]);
    if (iso && !found.has(iso)) found.set(iso, { raw: m[0], iso, labeled: true });
  }
  return [...found.values()].slice(0, 3);
}

/** Extract a jurisdiction: a known regulated city named in the text. */
function extractJurisdiction(text: string): { value: string; labeled: boolean } | null {
  for (const reg of Object.values(REGULATION_DATA)) {
    // Prefer an explicit "City of X" mention, then any mention of the city.
    if (new RegExp(`city\\s+of\\s+${reg.city}`, "i").test(text)) {
      return { value: `${reg.city}, ${reg.state_code}`, labeled: true };
    }
  }
  for (const reg of Object.values(REGULATION_DATA)) {
    if (new RegExp(`\\b${reg.city}\\b`, "i").test(text)) {
      return { value: `${reg.city}, ${reg.state_code}`, labeled: false };
    }
  }
  return null;
}

/** Extract a fee: a $ amount near a fee/total label. */
function extractFees(text: string): { value: string; labeled: boolean }[] {
  const found: { value: string; labeled: boolean }[] = [];
  const re = /\$\s?([\d,]+(?:\.\d{2})?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const window = text.slice(Math.max(0, m.index - 80), m.index);
    const labeled = FEE_LABEL.test(window);
    if (!labeled) continue;
    const value = `$${m[1]}`;
    if (!found.some((f) => f.value === value)) found.push({ value, labeled });
    if (found.length >= 3) break;
  }
  return found;
}

export default function PermitOcrUpload({ onExtract }: { onExtract: (v: OcrPrefill) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dates, setDates] = useState<DateCandidate[]>([]);
  const [numbers, setNumbers] = useState<string[]>([]);
  const [issueDates, setIssueDates] = useState<DateCandidate[]>([]);
  const [jurisdictions, setJurisdictions] = useState<FieldResult[]>([]);
  const [fees, setFees] = useState<FieldResult[]>([]);
  const [pageConfidence, setPageConfidence] = useState<number | null>(null);

  /** Run Tesseract on one image URL; returns text + overall confidence. */
  async function ocrImage(imageUrl: string, onProgress: (p: number) => void) {
    const Tesseract = (await import("tesseract.js")).default;
    const { data } = await Tesseract.recognize(imageUrl, "eng", {
      logger: (msg: any) => {
        if (msg?.status === "recognizing text" && typeof msg?.progress === "number") {
          onProgress(Math.round(msg.progress * 100));
        }
      },
    } as any);
    return { text: (data?.text ?? "").trim(), confidence: Number(data?.confidence ?? 0) };
  }

  /** Render the first pages of a PDF to image URLs (client-side, pdfjs-dist). */
  async function pdfToImageUrls(file: File): Promise<string[]> {
    let pdfjs: any;
    try {
      pdfjs = await import("pdfjs-dist");
    } catch {
      throw new Error("PDF support requires pdfjs-dist — see CHANGELOG_MERGED.md");
    }
    // Worker script is fetched from a CDN (same pattern as the Tesseract
    // language model); the PDF itself never leaves the browser.
    const cdn = (base: string) =>
      `${base}/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    pdfjs.GlobalWorkerOptions.workerSrc = cdn("https://cdn.jsdelivr.net");
    const buffer = await file.arrayBuffer();
    let pdf: any;
    try {
      pdf = await pdfjs.getDocument({ data: buffer }).promise;
    } catch {
      // Fall back to the alternate CDN before giving up.
      pdfjs.GlobalWorkerOptions.workerSrc = cdn("https://unpkg.com");
      pdf = await pdfjs.getDocument({ data: buffer }).promise;
    }
    const pages = Math.min(3, pdf.numPages);
    const urls: string[] = [];
    for (let i = 1; i <= pages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvasContext: ctx, viewport }).promise;
      urls.push(canvas.toDataURL("image/png"));
    }
    return urls;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setDates([]);
    setNumbers([]);
    setIssueDates([]);
    setJurisdictions([]);
    setFees([]);
    setPageConfidence(null);

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isImage = ["image/jpeg", "image/png"].includes(file.type);
    if (!isPdf && !isImage) {
      setState("error");
      setError("Please choose a JPG, PNG or PDF file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setState("error");
      setError("That file is larger than 15 MB. Please use a smaller file.");
      return;
    }

    setFileName(file.name);
    setState("reading");

    try {
      // Dynamic imports: tesseract.js (+ pdf.js for PDFs) are fetched only
      // when the user actually scans a document — never part of the main bundle.
      let imageUrls: string[] = [];
      let objectUrl: string | null = null;
      if (isPdf) {
        imageUrls = await pdfToImageUrls(file);
        if (imageUrls.length === 0) throw new Error("Could not render any page of this PDF.");
      } else {
        // Object URL lives in browser memory only; revoked after OCR. Nothing leaves the device.
        objectUrl = URL.createObjectURL(file);
        imageUrls = [objectUrl];
      }

      setState("ocr");
      setProgress(0);
      const allDates: DateCandidate[] = [];
      const allNumbers: string[] = [];
      const allIssue: DateCandidate[] = [];
      const allJuris: FieldResult[] = [];
      const allFees: FieldResult[] = [];
      let bestConfidence = 0;

      for (let pageIdx = 0; pageIdx < imageUrls.length; pageIdx++) {
        const { text, confidence } = await ocrImage(imageUrls[pageIdx], (p) => {
          const overall = Math.round(((pageIdx + p / 100) / imageUrls.length) * 100);
          setProgress(overall);
        });
        bestConfidence = Math.max(bestConfidence, confidence);
        if (!text || text.length < 10) continue;

        for (const d of extractDates(text)) {
          if (!allDates.some((x) => x.iso === d.iso)) allDates.push(d);
        }
        for (const n of extractPermitNumbers(text)) {
          if (!allNumbers.includes(n)) allNumbers.push(n);
        }
        for (const d of extractIssueDates(text)) {
          if (!allIssue.some((x) => x.iso === d.iso)) allIssue.push(d);
        }
        const juris = extractJurisdiction(text);
        if (juris) {
          allJuris.push({
            value: juris.value,
            labeled: juris.labeled,
            confidence: confidenceFor(confidence, juris.labeled),
            page: pageIdx + 1,
          });
        }
        for (const f of extractFees(text)) {
          allFees.push({
            value: f.value,
            labeled: f.labeled,
            confidence: confidenceFor(confidence, f.labeled),
            page: pageIdx + 1,
          });
        }
      }

      if (objectUrl) URL.revokeObjectURL(objectUrl);

      setPageConfidence(bestConfidence);
      if (
        allDates.length === 0 &&
        allNumbers.length === 0 &&
        allIssue.length === 0 &&
        allJuris.length === 0 &&
        allFees.length === 0
      ) {
        throw new Error("No dates, permit numbers, jurisdictions or fees could be recognized. Try a sharper image or a text-based PDF.");
      }
      setDates(allDates.slice(0, 5));
      setNumbers(allNumbers.slice(0, 5));
      setIssueDates(allIssue.slice(0, 3));
      setJurisdictions(allJuris.slice(0, 3));
      setFees(allFees.slice(0, 3));
      setState("done");
    } catch (err: any) {
      setState("error");
      setError(err?.message ?? "Something went wrong while scanning the document. Please try again.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function useDate(c: DateCandidate) {
    onExtract({ expiration_date: c.iso });
  }
  function useNumber(n: string) {
    onExtract({ permit_number: n });
  }
  function useIssueDate(c: DateCandidate) {
    onExtract({ issue_date: c.iso });
  }
  function useJurisdiction(v: string) {
    onExtract({ jurisdiction: v });
  }

  return (
    <div className="mb-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={handleFile}
        aria-label="Scan permit document (JPG, PNG or PDF)"
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
          Upload a photo, scan or PDF of the permit (JPG/PNG/PDF). Text is read in your browser — the file is never uploaded or stored. AI-powered extraction is a Professional/Business plan feature; this browser scan is free for all plans.
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
          {pageConfidence !== null && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              OCR confidence (best page): {pageConfidence}% — per-field confidence is shown below. Check every value before using it.
            </p>
          )}
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
          {issueDates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue date candidates
              </h3>
              <ul className="space-y-1">
                {issueDates.map((c) => (
                  <li key={c.iso} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-900 dark:text-white font-mono">{c.iso}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (as printed: {c.raw})
                    </span>
                    <button
                      type="button"
                      onClick={() => useIssueDate(c)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Use this
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {jurisdictions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jurisdiction candidates
              </h3>
              <ul className="space-y-1">
                {jurisdictions.map((f, i) => (
                  <li key={`${f.value}-${i}`} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-900 dark:text-white font-medium">{f.value}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      confidence {f.confidence}%{f.page > 1 ? ` · page ${f.page}` : ""}
                      {f.labeled ? " · labeled" : " · inferred"}
                    </span>
                    <button
                      type="button"
                      onClick={() => useJurisdiction(f.value)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Use this
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {fees.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fee candidates
              </h3>
              <ul className="space-y-1">
                {fees.map((f, i) => (
                  <li key={`${f.value}-${i}`} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-900 dark:text-white font-mono">{f.value}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      confidence {f.confidence}%{f.page > 1 ? ` · page ${f.page}` : ""}
                    </span>
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
