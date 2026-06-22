/**
 * Application feature flags, resolved from Firebase Remote Config with a
 * safe local fallback. See RemoteConfigService and docs/obsidian-mcp/05-feature-flags.md.
 */
export interface FeatureFlags {
  /** When false, the entire categories surface is hidden. */
  categoriesEnabled: boolean;
}

/** Remote Config keys (snake_case as defined in the Firebase console). */
export const REMOTE_CONFIG_KEYS = {
  categoriesEnabled: 'categories_enabled',
} as const;
