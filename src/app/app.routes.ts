import { Routes } from '@angular/router';

/**
 * Top-level routes. Every feature page is lazy-loaded via `loadComponent`
 * (ADR-001, performance: smaller initial bundle).
 *
 * - `/splash`   → animated splash, then redirects to tasks.
 * - `/tasks`    → home / task list (default).
 * - `/categories` → category management (will be guarded by the categories feature flag in Phase 7).
 */
export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () => import('./features/splash/pages/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/pages/task-list/task-list.page').then((m) => m.TaskListPage),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/pages/category-list/category-list.page').then(
        (m) => m.CategoryListPage,
      ),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
];
