import { describe, expect, it } from "vitest";
import { generateSlug, isValidSlug, SLUG_LENGTH } from "./slug";

describe("generateSlug", () => {
  it("produces URL-safe slugs of the default length", () => {
    for (let i = 0; i < 1000; i++) {
      const slug = generateSlug();
      expect(slug).toHaveLength(SLUG_LENGTH);
      expect(slug).toMatch(/^[A-Za-z0-9]+$/);
      expect(encodeURIComponent(slug)).toBe(slug);
    }
  });

  it("respects a custom length", () => {
    expect(generateSlug(12)).toHaveLength(12);
  });

  it("does not repeat across many draws", () => {
    const slugs = new Set(Array.from({ length: 10_000 }, () => generateSlug()));
    expect(slugs.size).toBe(10_000);
  });

  it("uses the whole alphabet", () => {
    const seen = new Set(Array.from({ length: 2000 }, () => generateSlug()).join(""));
    expect(seen.size).toBe(62);
  });
});

describe("isValidSlug", () => {
  it("accepts generated slugs", () => {
    expect(isValidSlug(generateSlug())).toBe(true);
  });

  it.each(["", "abc", "has space1", "a8K29x/..", "ünïcödé1", "x".repeat(17)])(
    "rejects %j",
    (value) => {
      expect(isValidSlug(value)).toBe(false);
    },
  );
});
