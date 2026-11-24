// Proper CSV parsing (RFC 4180): quoted fields may contain commas,
// embedded double-quotes (""), and newlines; both LF and CRLF line
// endings are handled. The old naive `split(",")` broke on the project's
// own template value "Austin, TX".

export type ParseCsvOptions = {
  /** Maximum data rows accepted (default 1000). Extra rows are rejected. */
  maxRows?: number;
};

export type ParseCsvResult = {
  /** Rows as header-name -> cell-value maps (headers lower-cased/trimmed). */
  rows: Record<string, string>[];
  /** Non-fatal problems, e.g. malformed rows that were skipped. */
  errors: string[];
};

/** Split raw CSV text into rows of raw cell strings. */
function tokenize(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let fieldWasQuoted = false;

  const pushField = () => {
    row.push(field);
    field = "";
    fieldWasQuoted = false;
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      // A quote only opens a quoted field at the very start of a field.
      if (field === "" && !fieldWasQuoted) {
        inQuotes = true;
        fieldWasQuoted = true;
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === ",") {
      pushField();
      continue;
    }
    if (ch === "\r") {
      if (text[i + 1] === "\n") i++;
      pushRow();
      continue;
    }
    if (ch === "\n") {
      pushRow();
      continue;
    }
    field += ch;
  }
  if (inQuotes) {
    // Unterminated quote: keep what we have; the caller sees the row.
    rows.push([...row, field]);
    return rows;
  }
  // Trailing content without a final newline still forms a row.
  if (field !== "" || row.length > 0) {
    pushRow();
  }
  return rows;
}

/**
 * Parse CSV text into header-mapped rows. Returns `{ rows, errors }`
 * instead of throwing: callers decide how to report per-row problems.
 */
export function parseCsv(text: string, options: ParseCsvOptions = {}): ParseCsvResult {
  const maxRows = options.maxRows ?? 1000;
  const errors: string[] = [];
  const rows: Record<string, string>[] = [];

  if (!text.trim()) return { rows, errors: ["CSV is empty"] };

  const rawRows = tokenize(text).filter(
    (r) => !(r.length === 1 && r[0].trim() === "")
  );
  if (rawRows.length === 0) return { rows, errors: ["CSV is empty"] };

  const headers = rawRows[0].map((h) => h.trim().toLowerCase());
  if (headers.length === 0 || headers.every((h) => h === "")) {
    return { rows, errors: ["CSV header row is missing"] };
  }

  for (let i = 1; i < rawRows.length; i++) {
    const lineNo = i + 1;
    if (rows.length >= maxRows) {
      errors.push(`Row limit of ${maxRows} exceeded; remaining rows skipped`);
      break;
    }
    const cells = rawRows[i];
    if (cells.length !== headers.length) {
      errors.push(
        `Row ${lineNo}: expected ${headers.length} columns, got ${cells.length}; skipped`
      );
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? "").trim();
    });
    rows.push(row);
  }

  return { rows, errors };
}
