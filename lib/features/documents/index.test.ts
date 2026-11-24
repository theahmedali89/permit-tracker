import { describe, expect, it } from "vitest";
import { MAX_DOCUMENT_SIZE, validateUploadInput } from "@/lib/features/documents";

function fakeFile(overrides: Partial<File> = {}): File {
  return {
    name: "doc.pdf",
    size: 1024,
    type: "application/pdf",
    ...overrides,
  } as File;
}

describe("validateUploadInput", () => {
  it("accepts a small PDF with a valid expiry date", () => {
    expect(() =>
      validateUploadInput({
        file: fakeFile(),
        permitId: null,
        projectId: null,
        expiryDate: "2027-01-01",
      })
    ).not.toThrow();
  });

  it("rejects oversized files", () => {
    expect(() =>
      validateUploadInput({
        file: fakeFile({ size: MAX_DOCUMENT_SIZE + 1 }),
        permitId: null,
        projectId: null,
        expiryDate: null,
      })
    ).toThrow("File too large");
  });

  it("rejects disallowed MIME types", () => {
    expect(() =>
      validateUploadInput({
        file: fakeFile({ type: "application/x-msdownload" }),
        permitId: null,
        projectId: null,
        expiryDate: null,
      })
    ).toThrow("Invalid file type");
  });

  it("rejects a bad expiry_date", () => {
    expect(() =>
      validateUploadInput({
        file: fakeFile(),
        permitId: null,
        projectId: null,
        expiryDate: "01/02/2027",
      })
    ).toThrow("Invalid expiry_date");
  });
});
