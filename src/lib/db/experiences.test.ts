import { describe, expect, it, vi } from "vitest";
import type { DbClient } from "./client";
import {
  createExperience,
  DatabaseError,
  getExperienceBySlug,
  MAX_SLUG_ATTEMPTS,
} from "./experiences";

type Result = { data: unknown; error: unknown };

/**
 * Minimal stand-in for the Supabase query builder: every chained call returns
 * the builder, and the terminal call (`single` / `maybeSingle`) resolves to
 * the next queued result.
 */
function fakeDb(...results: Result[]) {
  const calls = { insert: [] as unknown[], eq: [] as unknown[] };
  const next = vi.fn(async () => results.shift() ?? { data: null, error: null });
  const builder = {
    insert: (row: unknown) => (calls.insert.push(row), builder),
    select: () => builder,
    eq: (...args: unknown[]) => (calls.eq.push(args), builder),
    single: next,
    maybeSingle: next,
  };
  const db = { from: vi.fn(() => builder) } as unknown as DbClient;
  return { db, calls, next };
}

const row = {
  id: "0b8c7a52-6f43-4f0e-9a3e-2f0f3c1a9e11",
  slug: "a8K29xQm",
  type: "valentine",
  sender_name: "Alazar",
  recipient_name: "Sara",
  message: "Hi",
  created_at: "2026-10-02T10:00:00Z",
  updated_at: "2026-10-02T10:00:00Z",
};

const input = {
  type: "valentine" as const,
  senderName: "Alazar",
  recipientName: "Sara",
  message: "Hi",
};

const slugCollision = {
  code: "23505",
  message: 'duplicate key value violates unique constraint "experiences_slug_key"',
};

describe("createExperience", () => {
  it("inserts snake_case columns and returns a camelCase experience", async () => {
    const { db, calls } = fakeDb({ data: row, error: null });

    const experience = await createExperience(input, db);

    expect(calls.insert[0]).toMatchObject({
      type: "valentine",
      sender_name: "Alazar",
      recipient_name: "Sara",
      message: "Hi",
    });
    expect(experience).toEqual({
      id: row.id,
      slug: row.slug,
      type: "valentine",
      senderName: "Alazar",
      recipientName: "Sara",
      message: "Hi",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  });

  it("stores an empty message as null", async () => {
    const { db, calls } = fakeDb({ data: { ...row, message: null }, error: null });
    await createExperience({ ...input, message: "" }, db);
    expect(calls.insert[0]).toMatchObject({ message: null });
  });

  it("retries with a new slug after a slug collision", async () => {
    const { db, calls } = fakeDb(
      { data: null, error: slugCollision },
      { data: row, error: null },
    );

    await expect(createExperience(input, db)).resolves.toMatchObject({
      slug: row.slug,
    });

    const [first, second] = calls.insert as { slug: string }[];
    expect(calls.insert).toHaveLength(2);
    expect(first.slug).not.toBe(second.slug);
  });

  it("gives up after repeated collisions", async () => {
    const { db, next } = fakeDb(
      ...Array.from({ length: MAX_SLUG_ATTEMPTS }, () => ({
        data: null,
        error: slugCollision,
      })),
    );

    await expect(createExperience(input, db)).rejects.toBeInstanceOf(DatabaseError);
    expect(next).toHaveBeenCalledTimes(MAX_SLUG_ATTEMPTS);
  });

  it("does not retry other database errors", async () => {
    const dbError = { code: "08006", message: "connection failure" };
    const { db, next } = fakeDb({ data: null, error: dbError });

    const failure = createExperience(input, db);
    await expect(failure).rejects.toBeInstanceOf(DatabaseError);
    await expect(failure).rejects.toHaveProperty("cause", dbError);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("getExperienceBySlug", () => {
  it("returns the experience for a known slug", async () => {
    const { db, calls } = fakeDb({ data: row, error: null });

    await expect(getExperienceBySlug("a8K29xQm", db)).resolves.toMatchObject({
      senderName: "Alazar",
      recipientName: "Sara",
    });
    expect(calls.eq[0]).toEqual(["slug", "a8K29xQm"]);
  });

  it("returns null for an unknown slug", async () => {
    const { db } = fakeDb({ data: null, error: null });
    await expect(getExperienceBySlug("zzzzzzzz", db)).resolves.toBeNull();
  });

  it("returns null for a malformed slug without querying", async () => {
    const { db } = fakeDb();
    await expect(getExperienceBySlug("does-not-exist", db)).resolves.toBeNull();
    expect(db.from).not.toHaveBeenCalled();
  });

  it("throws DatabaseError when the query fails", async () => {
    const { db } = fakeDb({ data: null, error: { code: "", message: "fetch failed" } });
    await expect(getExperienceBySlug("a8K29xQm", db)).rejects.toBeInstanceOf(
      DatabaseError,
    );
  });

  it("rejects rows with an unknown type", async () => {
    const { db } = fakeDb({ data: { ...row, type: "birthday" }, error: null });
    await expect(getExperienceBySlug("a8K29xQm", db)).rejects.toBeInstanceOf(
      DatabaseError,
    );
  });
});
