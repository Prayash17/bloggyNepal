import "server-only";

/**
 * Shared engagement helpers for:
 * - reactions
 * - comments
 * - feedback
 * - newsletter
 */

/**
 * Safely convert unknown input to trimmed text
 * and limit its length.
 */
export function cleanText(
  value: unknown,
  maxLength: number
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate an email address.
 */
export function isValidEmail(
  email: string
): boolean {
  if (!email || email.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/**
 * Supported content types.
 */
const CONTENT_TYPES = [
  "district",
  "destination",
  "story",
] as const;

export type ContentType =
  (typeof CONTENT_TYPES)[number];

/**
 * Validate content type.
 */
export function isContentType(
  value: unknown
): value is ContentType {
  return (
    typeof value === "string" &&
    CONTENT_TYPES.includes(
      value as ContentType
    )
  );
}

/**
 * Supported reaction types.
 */
const REACTION_TYPES = [
  "heart",
  "fire",
  "star",
  "cry",
  "bulb",
] as const;

export type ReactionType =
  (typeof REACTION_TYPES)[number];

/**
 * Validate reaction type.
 */
export function isReactionType(
  value: unknown
): value is ReactionType {
  return (
    typeof value === "string" &&
    REACTION_TYPES.includes(
      value as ReactionType
    )
  );
}

/**
 * Basic comment validation.
 */
export function isValidComment(
  value: unknown
): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const text = value.trim();

  return (
    text.length >= 2 &&
    text.length <= 2000
  );
}

/**
 * Validate feedback type.
 */
const FEEDBACK_TYPES = [
  "bug",
  "suggestion",
  "correction",
  "general",
] as const;

export type FeedbackType =
  (typeof FEEDBACK_TYPES)[number];

export function isFeedbackType(
  value: unknown
): value is FeedbackType {
  return (
    typeof value === "string" &&
    FEEDBACK_TYPES.includes(
      value as FeedbackType
    )
  );
}