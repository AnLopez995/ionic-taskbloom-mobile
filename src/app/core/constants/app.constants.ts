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

/** Default icon options (ionicons names) offered when creating a category. */
export const CATEGORY_ICONS: readonly string[] = [
  'briefcase-outline',
  'home-outline',
  'heart-outline',
  'school-outline',
  'cart-outline',
  'fitness-outline',
  'airplane-outline',
  'sparkles-outline',
];

/** Sentinel used by the category filter to mean "all tasks". */
export const ALL_CATEGORIES = 'all' as const;
