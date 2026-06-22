import { computed, inject, Injectable, signal } from '@angular/core';
import { ALL_CATEGORIES } from '../constants/app.constants';
import { Task } from '../models';
import { CreateTaskInput, TaskService, UpdateTaskInput } from './task.service';

/** Aggregate progress numbers derived from the task list. */
export interface TaskStats {
  total: number;
  completed: number;
  /** Completion ratio in the [0, 1] range (0 when there are no tasks). */
  ratio: number;
  /** Completion percentage rounded to an integer. */
  percentage: number;
}

/**
 * Reactive task store (ADR-002). Holds the canonical task list in a signal and
 * exposes read-only signals + `computed()` projections (stats, filtered view) to
 * the UI. Mutations delegate to {@link TaskService} for persistence and then sync
 * the signal with whatever the repository returns — keeping memory and storage in
 * lockstep from a single round-trip.
 *
 * Filtering is non-mutating (`computed()` over the source list), so switching the
 * active category never copies or reorders the stored data (performance: see
 * [[08-performance-notes]]).
 */
@Injectable({ providedIn: 'root' })
export class TaskStateService {
  private readonly taskService = inject(TaskService);

  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _selectedCategoryId = signal<string>(ALL_CATEGORIES);

  /** All tasks, newest first. */
  readonly tasks = this._tasks.asReadonly();
  /** True while the initial load (or a refresh) is in flight. */
  readonly loading = this._loading.asReadonly();
  /** Currently active category filter (`ALL_CATEGORIES` shows everything). */
  readonly selectedCategoryId = this._selectedCategoryId.asReadonly();

  /** Tasks after applying the active category filter (non-mutating). */
  readonly filteredTasks = computed<Task[]>(() => {
    const categoryId = this._selectedCategoryId();
    const tasks = this._tasks();
    if (categoryId === ALL_CATEGORIES) {
      return tasks;
    }
    return tasks.filter((task) => task.categoryId === categoryId);
  });

  /** Progress summary derived from the (unfiltered) task list. */
  readonly stats = computed<TaskStats>(() => {
    const tasks = this._tasks();
    const total = tasks.length;
    const completed = tasks.reduce((count, task) => count + (task.completed ? 1 : 0), 0);
    const ratio = total === 0 ? 0 : completed / total;
    return { total, completed, ratio, percentage: Math.round(ratio * 100) };
  });

  /** Whether there are no tasks at all (drives the empty state). */
  readonly isEmpty = computed<boolean>(() => this._tasks().length === 0);

  /** Hydrate the store from persistence. Call once on app/page init. */
  async load(): Promise<void> {
    this._loading.set(true);
    try {
      this._tasks.set(await this.taskService.getTasks());
    } finally {
      this._loading.set(false);
    }
  }

  /** Create a task (ignores empty titles) and refresh state. */
  async addTask(input: CreateTaskInput): Promise<void> {
    if (!input.title.trim()) {
      return;
    }
    this._tasks.set(await this.taskService.addTask(input));
  }

  /** Patch a task and refresh state. */
  async updateTask(id: string, changes: UpdateTaskInput): Promise<void> {
    this._tasks.set(await this.taskService.updateTask(id, changes));
  }

  /** Toggle a task's completed flag and refresh state. */
  async toggleCompleted(id: string): Promise<void> {
    this._tasks.set(await this.taskService.toggleCompleted(id));
  }

  /** Delete a task and refresh state. */
  async deleteTask(id: string): Promise<void> {
    this._tasks.set(await this.taskService.deleteTask(id));
  }

  /** Assign (or clear) a task's category and refresh state. */
  async assignCategory(taskId: string, categoryId: string | null): Promise<void> {
    this._tasks.set(await this.taskService.assignCategory(taskId, categoryId));
  }

  /** Set the active category filter (synchronous; affects `filteredTasks`). */
  setCategoryFilter(categoryId: string): void {
    this._selectedCategoryId.set(categoryId);
  }

  /** Reset the filter to show every task. */
  clearCategoryFilter(): void {
    this._selectedCategoryId.set(ALL_CATEGORIES);
  }
}
