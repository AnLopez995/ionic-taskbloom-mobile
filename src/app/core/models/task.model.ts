/**
 * A single to-do item.
 *
 * Tasks reference their category by id (normalized data) so a task can exist
 * without a category and toggling the categories feature flag never breaks it.
 */
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  /** Id of the owning category, or null/undefined when uncategorized. */
  categoryId?: string | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
}
