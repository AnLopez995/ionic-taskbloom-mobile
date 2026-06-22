/** Default palette offered when creating a category. */
export const CATEGORY_COLORS: readonly string[] = [
  '#8b7cf6', // violet
  '#5eead4', // mint
  '#fb7185', // coral
  '#fbbf24', // amber
  '#60a5fa', // blue
  '#34d399', // green
  '#f472b6', // pink
  '#a3a3a3', // neutral
];

/**
 * Icon options (ionicons names) offered in the category picker. Keep this list
 * in sync with `registerCategoryIcons()` in core/utils/icons.util.ts — every name
 * here must be registered there or it won't render.
 */
export const CATEGORY_ICONS: readonly string[] = [
  // Work & study
  'briefcase-outline',
  'school-outline',
  'book-outline',
  'laptop-outline',
  // Home & errands
  'home-outline',
  'cart-outline',
  'construct-outline',
  'wallet-outline',
  // Health & exercise
  'heart-outline',
  'fitness-outline',
  'barbell-outline',
  'walk-outline',
  'bicycle-outline',
  // Sports
  'basketball-outline',
  'football-outline',
  'tennisball-outline',
  // Leisure & activities
  'musical-notes-outline',
  'game-controller-outline',
  'restaurant-outline',
  'cafe-outline',
  'camera-outline',
  'paw-outline',
  'people-outline',
  'airplane-outline',
  'leaf-outline',
  'sparkles-outline',
];

/** Sentinel used by the category filter to mean "all tasks". */
export const ALL_CATEGORIES = 'all' as const;
