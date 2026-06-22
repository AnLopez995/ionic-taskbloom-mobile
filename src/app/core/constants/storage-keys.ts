/**
 * Centralized persistence keys so no magic strings leak into feature code.
 * Bump the prefix version if the stored shape ever changes incompatibly.
 */
export const STORAGE_KEYS = {
  tasks: 'taskbloom.v1.tasks',
  categories: 'taskbloom.v1.categories',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
