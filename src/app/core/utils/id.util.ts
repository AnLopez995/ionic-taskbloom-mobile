/**
 * Generate a collision-resistant unique id.
 * Uses the native crypto.randomUUID when available, with a safe fallback.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Current time as an ISO 8601 string (single source for timestamps). */
export function nowIso(): string {
  return new Date().toISOString();
}
