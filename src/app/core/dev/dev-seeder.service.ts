import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { Category, Task } from '../models';
import { CategoryService } from '../services/category.service';
import { StorageService } from '../services/storage.service';
import { TaskStateService } from '../services/task-state.service';
import { createId, nowIso } from '../utils/id.util';

/** Default size of a seed batch — large enough to stress-test list rendering. */
const DEFAULT_SEED_COUNT = 500;

const SAMPLE_TITLES = [
  'Review pull request',
  'Water the plants',
  'Plan sprint goals',
  'Reply to emails',
  'Book dentist appointment',
  'Read a chapter',
  'Refactor task service',
  'Grocery run',
  'Call the bank',
  'Stretch for 10 minutes',
  'Write release notes',
  'Back up the database',
];

/**
 * Development-only data seeder (Phase 8). Bulk-inserts tasks so we can verify the
 * list stays smooth at scale (trackBy + OnPush + no per-row backdrop-filter).
 *
 * It writes the whole collection to storage in a **single** round-trip (not 500
 * `addTask` calls) and then refreshes the reactive store. Guarded so it does
 * nothing in production builds.
 */
@Injectable({ providedIn: 'root' })
export class DevSeederService {
  private readonly storage = inject(StorageService);
  private readonly categoryService = inject(CategoryService);
  private readonly taskState = inject(TaskStateService);

  /** True only outside production — UI should hide the seeder otherwise. */
  readonly enabled = !environment.production;

  /** Replace the task list with `count` generated tasks, then refresh the store. */
  async seedTasks(count = DEFAULT_SEED_COUNT): Promise<void> {
    if (!this.enabled) {
      return;
    }
    const categories = await this.categoryService.getCategories();
    const tasks = Array.from({ length: count }, (_, index) => this.makeTask(index, categories));
    await this.storage.set(STORAGE_KEYS.tasks, tasks);
    await this.taskState.load();
  }

  /** Remove every task, then refresh the store. */
  async clearTasks(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    await this.storage.set(STORAGE_KEYS.tasks, []);
    await this.taskState.load();
  }

  private makeTask(index: number, categories: Category[]): Task {
    const timestamp = nowIso();
    const title = `${SAMPLE_TITLES[index % SAMPLE_TITLES.length]} #${index + 1}`;
    // Spread ~1/3 of tasks across existing categories to exercise filtering.
    const category =
      categories.length > 0 && index % 3 === 0 ? categories[index % categories.length] : null;
    return {
      id: createId(),
      title,
      completed: index % 4 === 0,
      categoryId: category?.id ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
}
