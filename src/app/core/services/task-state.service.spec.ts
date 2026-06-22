import { TestBed } from '@angular/core/testing';
import { ALL_CATEGORIES } from '../constants/app.constants';
import { InMemoryStorageService } from '../testing/in-memory-storage.service';
import { StorageService } from './storage.service';
import { TaskService } from './task.service';
import { TaskStateService } from './task-state.service';

describe('TaskStateService', () => {
  let state: TaskStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskStateService,
        TaskService,
        InMemoryStorageService,
        { provide: StorageService, useExisting: InMemoryStorageService },
      ],
    });
    state = TestBed.inject(TaskStateService);
  });

  it('starts empty', () => {
    expect(state.tasks()).toEqual([]);
    expect(state.isEmpty()).toBeTrue();
    expect(state.stats()).toEqual({ total: 0, completed: 0, ratio: 0, percentage: 0 });
  });

  it('adds a task and updates the signal + stats', async () => {
    await state.addTask({ title: 'Write tests' });
    expect(state.tasks().length).toBe(1);
    expect(state.isEmpty()).toBeFalse();
    expect(state.stats().total).toBe(1);
  });

  it('ignores empty titles', async () => {
    await state.addTask({ title: '   ' });
    expect(state.tasks().length).toBe(0);
  });

  it('computes completion stats', async () => {
    await state.addTask({ title: 'A' });
    await state.addTask({ title: 'B' });
    const [b] = state.tasks(); // newest first → 'B'
    await state.toggleCompleted(b.id);
    expect(state.stats()).toEqual({ total: 2, completed: 1, ratio: 0.5, percentage: 50 });
  });

  it('hydrates from persistence via load()', async () => {
    await state.addTask({ title: 'Persisted' });
    const fresh = TestBed.inject(TaskStateService); // same singleton instance
    await fresh.load();
    expect(fresh.tasks().length).toBe(1);
  });

  it('filters by category without mutating the source list', async () => {
    await state.addTask({ title: 'Work task', categoryId: 'work' });
    await state.addTask({ title: 'Loose task' });
    state.setCategoryFilter('work');
    expect(state.filteredTasks().length).toBe(1);
    expect(state.filteredTasks()[0].title).toBe('Work task');
    expect(state.tasks().length).toBe(2); // source untouched
    state.clearCategoryFilter();
    expect(state.filteredTasks().length).toBe(2);
  });

  it('deletes a task', async () => {
    await state.addTask({ title: 'Delete me' });
    const [task] = state.tasks();
    await state.deleteTask(task.id);
    expect(state.tasks().length).toBe(0);
  });

  it('clearCategory detaches the category and resets an active filter', async () => {
    await state.addTask({ title: 'Work task', categoryId: 'work' });
    state.setCategoryFilter('work');
    await state.clearCategory('work');
    expect(state.tasks()[0].categoryId).toBeNull();
    expect(state.selectedCategoryId()).toBe(ALL_CATEGORIES);
  });
});
