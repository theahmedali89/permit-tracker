"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";

export type CustomFieldRow = { key: string; value: string };

export default function CustomFieldsInput({
  initial = {},
  onChange,
}: {
  initial?: Record<string, string>;
  onChange?: (fields: Record<string, string>) => void;
}) {
  const [rows, setRows] = useState<CustomFieldRow[]>(() =>
    Object.entries(initial || {}).map(([key, value]) => ({ key, value }))
  );

  function emit(next: CustomFieldRow[]) {
    setRows(next);
    if (onChange) {
      const obj: Record<string, string> = {};
      for (const r of next) {
        if (r.key.trim()) obj[r.key.trim()] = r.value;
      }
      onChange(obj);
    }
  }

  function updateRow(i: number, patch: Partial<CustomFieldRow>) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    emit(next);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Custom Fields
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Add your own key-value details (e.g. Parcel #, Contractor license).
      </p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              placeholder="Field name"
              value={row.key}
              onChange={(e) => updateRow(i, { key: e.target.value })}
            />
            <Input
              placeholder="Value"
              value={row.value}
              onChange={(e) => updateRow(i, { value: e.target.value })}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => emit(rows.filter((_, idx) => idx !== i))}
              aria-label="Remove field"
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        className="mt-2"
        onClick={() => emit([...rows, { key: "", value: "" }])}
      >
        + Add Field
      </Button>
    </div>
  );
}
