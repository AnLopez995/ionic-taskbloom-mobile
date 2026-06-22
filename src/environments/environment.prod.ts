/**
 * Production environment. Paste your real Firebase web config here.
 * The app still degrades gracefully if Firebase is unreachable (ADR-004).
 */
export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyDYWaNEJOD_U3I_0OmswAvtIoQFMCoxk_c",
    authDomain: "taskbloom-bacaf.firebaseapp.com",
    projectId: "taskbloom-bacaf",
    storageBucket: "taskbloom-bacaf.firebasestorage.app",
    messagingSenderId: "594610299287",
    appId: "1:594610299287:web:86ff43f561182313c764d2"
  },
  remoteConfigDefaults: {
    categories_enabled: true,
  },
  /** Recommended: 3600000 (1h) in production. */
  remoteConfigFetchIntervalMs: 3600000,
};
