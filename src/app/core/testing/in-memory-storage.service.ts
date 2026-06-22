import { Injectable } from '@angular/core';

/**
 * In-memory stand-in for {@link StorageService} used in unit tests. Backed by a
 * plain Map so specs exercise business logic without touching IndexedDB.
 * Provide it with `{ provide: StorageService, useClass: InMemoryStorageService }`.
 */
@Injectable()
export class InMemoryStorageService {
  private readonly store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.store.has(key) ? this.store.get(key) : null) as T | null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }
}
