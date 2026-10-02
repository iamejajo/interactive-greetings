import "server-only";
import { isExperienceType } from "@/experiences/registry";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";
import type { Experience, NewExperience } from "@/types/experience";
import { getDb, type DbClient } from "./client";
import type { Database } from "./database.types";

type ExperienceRow = Database["public"]["Tables"]["experiences"]["Row"];

const COLUMNS =
  "id, slug, type, sender_name, recipient_name, message, created_at, updated_at";

/** Fresh slugs to try before giving up; a collision is ~1 in 10¹⁴ per try. */
export const MAX_SLUG_ATTEMPTS = 5;

const UNIQUE_VIOLATION = "23505";
const SLUG_CONSTRAINT = "experiences_slug_key";

/** Any failure talking to the database. `cause` carries the driver error for logs. */
export class DatabaseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DatabaseError";
  }
}

/**
 * Stores a new experience under a freshly generated slug, retrying with a
 * new slug if the database reports a collision. Input must already be
 * validated.
 */
export async function createExperience(
  input: NewExperience,
  db: DbClient = getDb(),
): Promise<Experience> {
  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    const { data, error } = await db
      .from("experiences")
      .insert({
        slug: generateSlug(),
        type: input.type,
        sender_name: input.senderName,
        recipient_name: input.recipientName,
        message: input.message || null,
      })
      .select(COLUMNS)
      .single();

    if (!error) return toExperience(data);

    const isSlugCollision =
      error.code === UNIQUE_VIOLATION && error.message.includes(SLUG_CONSTRAINT);
    if (!isSlugCollision) {
      throw new DatabaseError("Failed to create experience", { cause: error });
    }
  }

  throw new DatabaseError(
    `Could not find a free slug after ${MAX_SLUG_ATTEMPTS} attempts`,
  );
}

/** Looks up an experience by its public slug; `null` when there is none. */
export async function getExperienceBySlug(
  slug: string,
  db: DbClient = getDb(),
): Promise<Experience | null> {
  // Malformed slugs can't exist in the table — skip the round trip.
  if (!isValidSlug(slug)) return null;

  const { data, error } = await db
    .from("experiences")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new DatabaseError("Failed to load experience", { cause: error });
  }
  return data ? toExperience(data) : null;
}

function toExperience(row: ExperienceRow): Experience {
  if (!isExperienceType(row.type)) {
    throw new DatabaseError(`Unknown experience type "${row.type}"`);
  }
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    senderName: row.sender_name,
    recipientName: row.recipient_name,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
