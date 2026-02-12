/**
 * Slug generator using Node.js built-in crypto module.
 *
 * Generates URL-safe random strings of a given length without
 * any external dependencies (no nanoid needed).
 */

import { randomBytes } from "crypto";

/** Characters safe for use in URL slugs. */
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const DEFAULT_LENGTH = 6;

/**
 * Generate a random slug of the specified length.
 *
 * Uses crypto.randomBytes for cryptographic randomness, then maps
 * each byte to a character in the URL-safe alphabet using modulo
 * (bias is negligible for this use case).
 */
export function generateSlug(length: number = DEFAULT_LENGTH): string {
  const bytes = randomBytes(length);
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return slug;
}
