import { computed, inject, Injectable, signal } from '@angular/core';
import { Category } from '../models';
import { CategoryService, CreateCategoryInput, UpdateCategoryInput } from './category.service';
import { TaskStateService } from './task-state.service';

/**
 * Reactive category store (ADR-002). Holds the canonical category list in a
 * signal and exposes read-only signals + `computed()` projections to the UI.
 *
 * Task counts per category are derived (`computed()`) from the task store, so the
 * counter shown on the management screen updates automatically as tasks change —
 * no manual recalculation, no duplicated state (performance: [[08-performance-notes]]).
 *
 * Deleting a category also detaches it from its tasks: this store deletes the
 * category, then asks {@link TaskStateService} to clear the reference, keeping the
 * cascade in one place while each repository stays single-responsibility.
 */
@Injectable({ providedIn: 'root' })
export class CategoryStateService {
  private readonly categoryService = inject(CategoryService);
  private readonly taskState = inject(TaskStateService);

  private readonly _categories = signal<Category[]>([]);
  private readonly _loading = signal<boolean>(false);

  /** All categories, newest first. */
  readonly categories = this._categories.asReadonly();
  /** True while the initial load (or a refresh) is in flight. */
  readonly loading = this._loading.asReadonly();
  /** Whether there are no categories yet (drives the empty state). */
  readonly isEmpty = computed<boolean>(() => this._categories().length === 0);

  /** Map of categoryId → number of tasks assigned to it (derived from the task store). */
  readonly taskCountByCategory = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const task of this.taskState.tasks()) {
      if (task.categoryId) {
        counts[task.categoryId] = (counts[task.categoryId] ?? 0) + 1;
      }
    }
    return counts;
  });

  /** Hydrate the store from persistence. Call once on app/page init. */
  async load(): Promise<void> {
    this._loading.set(true);
    try {
      this._categories.set(await this.categoryService.getCategories());
    } finally {
      this._loading.set(false);
    }
  }

  /** Create a category (ignores empty names) and refresh state. */
  async addCategory(input: CreateCategoryInput): Promise<void> {
    if (!input.name.trim()) {
      return;
    }
    this._categories.set(await this.categoryService.addCategory(input));
  }

  /** Patch a category and refresh state. */
  async updateCategory(id: string, changes: UpdateCategoryInput): Promise<void> {
    this._categories.set(await this.categoryService.updateCategory(id, changes));
  }

  /** Delete a category, detach it from its tasks, and refresh state. */
  async deleteCategory(id: string): Promise<void> {
    this._categories.set(await this.categoryService.deleteCategory(id));
    await this.taskState.clearCategory(id);
  }
}
