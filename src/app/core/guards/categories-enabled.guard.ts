import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RemoteConfigService } from '../services/remote-config.service';

/**
 * Blocks the `/categories` route when the `categories_enabled` feature flag is
 * off (ADR-004), redirecting to the task list. Pairs with the in-page UI gating
 * so the categories surface can be hidden entirely from Remote Config without
 * leaving a reachable orphan route.
 */
export const categoriesEnabledGuard: CanActivateFn = () => {
  const remoteConfig = inject(RemoteConfigService);
  const router = inject(Router);
  return remoteConfig.isCategoriesEnabled() ? true : router.createUrlTree(['/tasks']);
};
