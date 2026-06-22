import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';

import { routes } from './app.routes';

/**
 * Root application providers (standalone bootstrap — ADR-002).
 * - Ionic standalone runtime + iOS-style route reuse.
 * - Router with lazy routes and module preloading.
 * - Ionic Storage for the local persistence layer (ADR-003).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicStorageModule.forRoot()),
  ],
};
