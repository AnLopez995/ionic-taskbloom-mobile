/**
 * A label used to group tasks. Optional color/icon power the premium UI.
 */
export interface Category {
  id: string;
  name: string;
  /** Hex color or CSS color token used for the chip/dot. */
  color?: string;
  /** Ionicon name (e.g. 'briefcase-outline'). */
  icon?: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
}
