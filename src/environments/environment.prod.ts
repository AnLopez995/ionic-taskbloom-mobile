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
  /**
   * 0 = fetch the latest values on every launch, so toggling the flag in the
   * Firebase console takes effect on the next app start (required for the demo).
   * A real production app would raise this (e.g. 3600000 = 1h) to save bandwidth,
   * accepting that flag changes then propagate within that window.
   */
  remoteConfigFetchIntervalMs: 0,
};
