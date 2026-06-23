import { computed, Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { fetchAndActivate, getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { environment } from '../../../environments/environment';
import { FeatureFlags, REMOTE_CONFIG_KEYS } from '../models';

/**
 * Max time we wait for a Remote Config fetch before falling back to defaults.
 * Generous enough for a cold first fetch on a real mobile network (Firebase
 * Installations handshake + config fetch), while still bounding startup.
 */
const FETCH_TIMEOUT_MS = 8000;

/**
 * Resolves application feature flags from Firebase Remote Config with a **safe
 * local fallback** (ADR-004). The app must never break because Firebase is
 * missing, misconfigured, slow, or offline:
 *
 * - Flags start at `environment.remoteConfigDefaults` and are exposed as signals.
 * - If there is no usable Firebase config, we skip Firebase entirely.
 * - Any init/fetch error (or a timeout) is swallowed and the defaults stand.
 *
 * UI and route guards read {@link categoriesEnabled} / {@link isCategoriesEnabled}.
 */
@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private readonly _flags = signal<FeatureFlags>(this.defaultFlags());

  /** Current feature flags (reactive). */
  readonly flags = this._flags.asReadonly();
  /** Convenience signal for the only flag we ship today. */
  readonly categoriesEnabled = computed(() => this._flags().categoriesEnabled);

  /**
   * Initialize Firebase + Remote Config and activate fetched values. Called once
   * at app startup (see app.config.ts). Always resolves — never rejects — so a
   * Remote Config problem can never block bootstrap.
   */
  async init(): Promise<void> {
    if (!this.hasFirebaseConfig()) {
      // No credentials wired up → run on local defaults. Expected in the demo.
      return;
    }
    try {
      const remoteConfig = this.createRemoteConfig();
      await this.withTimeout(fetchAndActivate(remoteConfig), FETCH_TIMEOUT_MS);
      this._flags.set({
        categoriesEnabled: getValue(remoteConfig, REMOTE_CONFIG_KEYS.categoriesEnabled).asBoolean(),
      });
    } catch (error) {
      console.warn('[RemoteConfig] Using local defaults — remote fetch failed:', error);
    }
  }

  /** Synchronous read for route guards. */
  isCategoriesEnabled(): boolean {
    return this._flags().categoriesEnabled;
  }

  private createRemoteConfig(): RemoteConfig {
    const app = initializeApp(environment.firebase);
    const remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.fetchTimeoutMillis = FETCH_TIMEOUT_MS;
    remoteConfig.settings.minimumFetchIntervalMillis = environment.remoteConfigFetchIntervalMs;
    remoteConfig.defaultConfig = {
      [REMOTE_CONFIG_KEYS.categoriesEnabled]: environment.remoteConfigDefaults.categories_enabled,
    };
    return remoteConfig;
  }

  private defaultFlags(): FeatureFlags {
    return { categoriesEnabled: environment.remoteConfigDefaults.categories_enabled };
  }

  /** True only when the essential Firebase web-config fields are present. */
  private hasFirebaseConfig(): boolean {
    const { apiKey, projectId, appId } = environment.firebase;
    return Boolean(apiKey && projectId && appId);
  }

  /** Reject if the promise does not settle within `ms` (so a hung fetch can't stall us). */
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Remote Config fetch timed out')), ms),
      ),
    ]);
  }
}
