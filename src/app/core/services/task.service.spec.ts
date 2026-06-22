import { TestBed } from '@angular/core/testing';
import { InMemoryStorageService } from '../testing/in-memory-storage.service';
import { StorageService } from './storage.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        InMemoryStorageService,
        { provide: StorageService, useExisting: InMemoryStorageService },
      ],
    });
    service = TestBed.inject(TaskService);
  });

  it('returns an empty list when nothing is stored', async () => {
    expect(await service.getTasks()).toEqual([]);
  });

  it('adds a task with a generated id, timestamps, trimmed title, and uncompleted state', async () => {
    const tasks = await service.addTask({ title: '  Buy milk  ' });
    expect(tasks.length).toBe(1);
    const [task] = tasks;
    expect(task.id).toBeTruthy();
    expect(task.title).toBe('Buy milk');
    expect(task.completed).toBeFalse();
    expect(task.categoryId).toBeNull();
    expect(task.createdAt).toBe(task.updatedAt);
    expect(new Date(task.createdAt).toString()).not.toBe('Invalid Date');
  });

  it('prepends new tasks (newest first)', async () => {
    await service.addTask({ title: 'First' });
    const tasks = await service.addTask({ title: 'Second' });
    expect(tasks.map((t) => t.title)).toEqual(['Second', 'First']);
  });

  it('updates a task and bumps updatedAt', async () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-01-01T00:00:00.000Z'));
    const [created] = await service.addTask({ title: 'Old' });
    jasmine.clock().tick(1000);
    const updated = await service.updateTask(created.id, { title: 'New' });
    jasmine.clock().uninstall();
    expect(updated[0].title).toBe('New');
    expect(updated[0].updatedAt).not.toBe(created.updatedAt);
    expect(new Date(updated[0].updatedAt).getTime()).toBeGreaterThan(
      new Date(created.updatedAt).getTime(),
    );
  });

  it('leaves the list unchanged when updating a missing id', async () => {
    await service.addTask({ title: 'Only' });
    const result = await service.updateTask('does-not-exist', { title: 'X' });
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Only');
  });

  it('toggles completion', async () => {
    const [created] = await service.addTask({ title: 'Toggle me' });
    const afterOn = await service.toggleCompleted(created.id);
    expect(afterOn[0].completed).toBeTrue();
    const afterOff = await service.toggleCompleted(created.id);
    expect(afterOff[0].completed).toBeFalse();
  });

  it('deletes a task by id', async () => {
    const [a] = await service.addTask({ title: 'A' });
    await service.addTask({ title: 'B' });
    const result = await service.deleteTask(a.id);
    expect(result.map((t) => t.title)).toEqual(['B']);
  });

  it('assigns and clears a category', async () => {
    const [task] = await service.addTask({ title: 'Categorize' });
    const assigned = await service.assignCategory(task.id, 'cat-1');
    expect(assigned[0].categoryId).toBe('cat-1');
    const cleared = await service.assignCategory(task.id, null);
    expect(cleared[0].categoryId).toBeNull();
  });

  it('queries tasks by category', async () => {
    const [a] = await service.addTask({ title: 'A' });
    await service.addTask({ title: 'B' });
    await service.assignCategory(a.id, 'work');
    const inWork = await service.getTasksByCategory('work');
    expect(inWork.length).toBe(1);
    expect(inWork[0].title).toBe('A');
  });

  it('clears a category from every task that references it', async () => {
    const [a] = await service.addTask({ title: 'A' });
    const [b] = await service.addTask({ title: 'B' });
    await service.assignCategory(a.id, 'work');
    await service.assignCategory(b.id, 'work');
    const result = await service.clearCategoryFromTasks('work');
    expect(result.every((t) => t.categoryId === null)).toBeTrue();
  });

  it('persists across service usage (data survives a re-read)', async () => {
    await service.addTask({ title: 'Persisted' });
    const reread = await service.getTasks();
    expect(reread.length).toBe(1);
    expect(reread[0].title).toBe('Persisted');
  });
});
