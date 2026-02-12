/**
 * Input validation helpers.
 *
 * Validates URL format and other inputs without external dependencies.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that a string is a well-formed HTTP or HTTPS URL.
 *
 * Uses the built-in URL constructor for parsing, then checks the
 * protocol is http or https.
 */
export function validateUrl(input: unknown): ValidationResult {
  if (typeof input !== "string" || input.trim().length === 0) {
    return { valid: false, error: "URL is required" };
  }

  const trimmed = input.trim();

  if (trimmed.length > 2048) {
    return { valid: false, error: "URL is too long (max 2048 characters)" };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        valid: false,
        error: "URL must use http or https protocol",
      };
    }
    if (!parsed.hostname.includes(".")) {
      return { valid: false, error: "URL must have a valid hostname" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}
