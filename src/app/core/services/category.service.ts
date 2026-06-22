import { inject, Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { Category } from '../models';
import { createId, nowIso } from '../utils/id.util';
import { StorageService } from './storage.service';

/** Fields a caller may provide when creating a category. */
export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

/** Fields a caller may patch on an existing category. */
export type UpdateCategoryInput = Partial<Pick<Category, 'name' | 'color' | 'icon'>>;

/**
 * Category repository: the single source of truth for category persistence.
 *
 * Mirrors {@link TaskService} — it owns reading/writing the category collection
 * through {@link StorageService} (ADR-003) and never touches the UI. The
 * cross-entity rule "detach a deleted category from its tasks" is orchestrated in
 * `CategoryStateService` (which deletes here, then asks the task store to clear
 * the reference) so this service stays focused on a single collection (SRP).
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly storage = inject(StorageService);

  /** Load all categories, newest first. Empty list when nothing is stored. */
  async getCategories(): Promise<Category[]> {
    const categories = await this.storage.get<Category[]>(STORAGE_KEYS.categories);
    return categories ?? [];
  }

  /** Create a category with generated id + timestamps. Returns the updated list. */
  async addCategory(input: CreateCategoryInput): Promise<Category[]> {
    const timestamp = nowIso();
    const category: Category = {
      id: createId(),
      name: input.name.trim(),
      color: input.color,
      icon: input.icon,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const categories = await this.getCategories();
    const next = [category, ...categories];
    await this.persist(next);
    return next;
  }

  /** Patch a category by id and bump `updatedAt`. Returns the updated list. */
  async updateCategory(id: string, changes: UpdateCategoryInput): Promise<Category[]> {
    const categories = await this.getCategories();
    const next = categories.map((category) =>
      category.id === id ? { ...category, ...changes, updatedAt: nowIso() } : category,
    );
    await this.persist(next);
    return next;
  }

  /** Remove a category by id. Returns the updated list. */
  async deleteCategory(id: string): Promise<Category[]> {
    const categories = await this.getCategories();
    const next = categories.filter((category) => category.id !== id);
    await this.persist(next);
    return next;
  }

  private async persist(categories: Category[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.categories, categories);
  }
}
