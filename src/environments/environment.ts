/**
 * Development environment.
 *
 * Firebase config is a PLACEHOLDER. The app runs fully without it: if the
 * config is empty/invalid or Firebase is unreachable, RemoteConfigService
 * falls back to `remoteConfigDefaults` (see ADR-004). Paste your own web
 * config from the Firebase console to enable live Remote Config.
 */
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDYWaNEJOD_U3I_0OmswAvtIoQFMCoxk_c",
    authDomain: "taskbloom-bacaf.firebaseapp.com",
    projectId: "taskbloom-bacaf",
    storageBucket: "taskbloom-bacaf.firebasestorage.app",
    messagingSenderId: "594610299287",
    appId: "1:594610299287:web:86ff43f561182313c764d2"
  },
  /** Local fallback values for Remote Config (mirror the keys in the console). */
  remoteConfigDefaults: {
    categories_enabled: true,
  },
  /** Low in dev so flag changes appear quickly; raise for production. */
  remoteConfigFetchIntervalMs: 0,
};
