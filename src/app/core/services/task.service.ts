import { inject, Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { Task } from '../models';
import { createId, nowIso } from '../utils/id.util';
import { StorageService } from './storage.service';

/** Fields a caller may provide when creating a task. */
export interface CreateTaskInput {
  title: string;
  categoryId?: string | null;
}

/** Fields a caller may patch on an existing task (id/timestamps are managed here). */
export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'completed' | 'categoryId'>>;

/**
 * Task repository: the single source of truth for task persistence.
 *
 * It owns reading/writing the task collection through {@link StorageService}
 * (ADR-003) and never touches the UI. Reactive state lives in `TaskStateService`,
 * which calls this service and projects the result into signals.
 *
 * All mutators return the resulting collection so the caller can update state in
 * one round-trip without a second read.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly storage = inject(StorageService);

  /** Load all tasks, newest first. Returns an empty list when nothing is stored. */
  async getTasks(): Promise<Task[]> {
    const tasks = await this.storage.get<Task[]>(STORAGE_KEYS.tasks);
    return tasks ?? [];
  }

  /** Create a task with generated id + timestamps. Returns the full updated list. */
  async addTask(input: CreateTaskInput): Promise<Task[]> {
    const timestamp = nowIso();
    const task: Task = {
      id: createId(),
      title: input.title.trim(),
      completed: false,
      categoryId: input.categoryId ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const tasks = await this.getTasks();
    const next = [task, ...tasks];
    await this.persist(next);
    return next;
  }

  /** Patch a task by id and bump `updatedAt`. No-op (returns current list) if absent. */
  async updateTask(id: string, changes: UpdateTaskInput): Promise<Task[]> {
    const tasks = await this.getTasks();
    const next = tasks.map((task) =>
      task.id === id ? { ...task, ...changes, updatedAt: nowIso() } : task,
    );
    await this.persist(next);
    return next;
  }

  /** Remove a task by id. Returns the updated list. */
  async deleteTask(id: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    const next = tasks.filter((task) => task.id !== id);
    await this.persist(next);
    return next;
  }

  /** Flip a task's completed flag. Returns the updated list. */
  async toggleCompleted(id: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    const next = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed, updatedAt: nowIso() } : task,
    );
    await this.persist(next);
    return next;
  }

  /** Assign (or clear, with null) a category on a task. Returns the updated list. */
  async assignCategory(taskId: string, categoryId: string | null): Promise<Task[]> {
    return this.updateTask(taskId, { categoryId });
  }

  /** Read-only query: tasks belonging to a given category id. */
  async getTasksByCategory(categoryId: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter((task) => task.categoryId === categoryId);
  }

  /**
   * Detach a category from every task that references it (called when a category
   * is deleted, so no task is left pointing at a missing category). Returns the
   * updated list.
   */
  async clearCategoryFromTasks(categoryId: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    const next = tasks.map((task) =>
      task.categoryId === categoryId ? { ...task, categoryId: null, updatedAt: nowIso() } : task,
    );
    await this.persist(next);
    return next;
  }

  private async persist(tasks: Task[]): Promise<void> {
    await this.storage.set(STORAGE_KEYS.tasks, tasks);
  }
}
