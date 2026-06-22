import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Thin, typed abstraction over the local persistence engine.
 *
 * Feature code depends only on get/set/remove and never touches the storage
 * engine directly (ADR-003). The underlying `@ionic/storage-angular` driver
 * (IndexedDB / localStorage) is created lazily on first use.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly ionicStorage = inject(Storage);
  private storage: Storage | null = null;
  private ready: Promise<Storage> | null = null;

  /** Idempotently create the underlying storage instance. */
  private async ensureReady(): Promise<Storage> {
    if (this.storage) {
      return this.storage;
    }
    this.ready ??= this.ionicStorage.create();
    this.storage = await this.ready;
    return this.storage;
  }

  /** Read a value by key, or null when absent. Never throws on a miss. */
  async get<T>(key: string): Promise<T | null> {
    const storage = await this.ensureReady();
    const value = await storage.get(key);
    return (value ?? null) as T | null;
  }

  /** Persist a value under a key. */
  async set<T>(key: string, value: T): Promise<void> {
    const storage = await this.ensureReady();
    await storage.set(key, value);
  }

  /** Remove a value by key. */
  async remove(key: string): Promise<void> {
    const storage = await this.ensureReady();
    await storage.remove(key);
  }
}
