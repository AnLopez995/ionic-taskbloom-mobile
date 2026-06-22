import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './storage.service';

/** Fake @ionic/storage Storage: `create()` returns itself; data lives in a Map. */
class FakeStorage {
  private readonly map = new Map<string, unknown>();
  create(): Promise<FakeStorage> {
    return Promise.resolve(this);
  }
  get(key: string): Promise<unknown> {
    return Promise.resolve(this.map.has(key) ? this.map.get(key) : null);
  }
  set(key: string, value: unknown): Promise<void> {
    this.map.set(key, value);
    return Promise.resolve();
  }
  remove(key: string): Promise<void> {
    this.map.delete(key);
    return Promise.resolve();
  }
}

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService, { provide: Storage, useClass: FakeStorage }],
    });
    service = TestBed.inject(StorageService);
  });

  it('returns null for a missing key', async () => {
    expect(await service.get('nope')).toBeNull();
  });

  it('persists and reads back a value of any shape', async () => {
    await service.set('user', { name: 'Ada', tasks: 3 });
    expect(await service.get('user')).toEqual({ name: 'Ada', tasks: 3 });
  });

  it('removes a value', async () => {
    await service.set('temp', 1);
    await service.remove('temp');
    expect(await service.get('temp')).toBeNull();
  });

  it('creates the underlying storage only once across calls', async () => {
    const ionicStorage = TestBed.inject(Storage) as unknown as FakeStorage;
    const createSpy = spyOn(ionicStorage, 'create').and.callThrough();
    await service.set('a', 1);
    await service.get('a');
    await service.remove('a');
    expect(createSpy).toHaveBeenCalledTimes(1);
  });
});
