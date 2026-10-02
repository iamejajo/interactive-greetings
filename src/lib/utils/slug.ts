const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * 8 characters from a 62-letter alphabet ≈ 2.2 × 10¹⁴ combinations: short
 * enough to share, large enough that guessing someone's link is impractical.
 */
export const SLUG_LENGTH = 8;

/** Matches the database's `experiences_slug_format` constraint. */
export const SLUG_PATTERN = /^[A-Za-z0-9]{6,16}$/;

/** Cryptographically random, URL-safe slug, e.g. "a8K29xQm". */
export function generateSlug(length: number = SLUG_LENGTH): string {
  // Rejection sampling: 248 is the largest multiple of 62 below 256, so
  // bytes ≥ 248 are discarded to keep every character equally likely.
  const limit = 256 - (256 % ALPHABET.length);
  let slug = "";
  while (slug.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const byte of bytes) {
      if (byte < limit) slug += ALPHABET[byte % ALPHABET.length];
      if (slug.length === length) break;
    }
  }
  return slug;
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}
