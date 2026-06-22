/**
 * Production environment. Paste your real Firebase web config here.
 * The app still degrades gracefully if Firebase is unreachable (ADR-004).
 */
export const environment = {
  production: true,
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
  remoteConfigDefaults: {
    categories_enabled: true,
  },
  /** Recommended: 3600000 (1h) in production. */
  remoteConfigFetchIntervalMs: 3600000,
};
