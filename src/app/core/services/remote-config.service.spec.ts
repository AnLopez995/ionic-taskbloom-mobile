import { TestBed } from '@angular/core/testing';
import { RemoteConfigService } from './remote-config.service';

/**
 * These specs run with the placeholder (empty) Firebase config from
 * environment.ts, so they exercise the **local-fallback** path (ADR-004):
 * Firebase is skipped and the defaults stand.
 */
describe('RemoteConfigService (local fallback)', () => {
  let service: RemoteConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RemoteConfigService] });
    service = TestBed.inject(RemoteConfigService);
  });

  it('defaults categoriesEnabled to true from environment defaults', () => {
    expect(service.categoriesEnabled()).toBeTrue();
    expect(service.isCategoriesEnabled()).toBeTrue();
    expect(service.flags()).toEqual({ categoriesEnabled: true });
  });

  it('init() resolves without throwing when Firebase is not configured', async () => {
    await expectAsync(service.init()).toBeResolved();
  });

  it('keeps the default flag after init() with no Firebase config', async () => {
    await service.init();
    expect(service.isCategoriesEnabled()).toBeTrue();
  });
});
