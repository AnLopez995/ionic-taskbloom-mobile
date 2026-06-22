import { TestBed } from '@angular/core/testing';
import { InMemoryStorageService } from '../testing/in-memory-storage.service';
import { CategoryService } from './category.service';
import { StorageService } from './storage.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        InMemoryStorageService,
        { provide: StorageService, useExisting: InMemoryStorageService },
      ],
    });
    service = TestBed.inject(CategoryService);
  });

  it('returns an empty list when nothing is stored', async () => {
    expect(await service.getCategories()).toEqual([]);
  });

  it('adds a category with id, timestamps, color and icon', async () => {
    const categories = await service.addCategory({
      name: '  Work  ',
      color: '#8b7cf6',
      icon: 'briefcase-outline',
    });
    expect(categories.length).toBe(1);
    const [category] = categories;
    expect(category.id).toBeTruthy();
    expect(category.name).toBe('Work');
    expect(category.color).toBe('#8b7cf6');
    expect(category.icon).toBe('briefcase-outline');
    expect(category.createdAt).toBe(category.updatedAt);
  });

  it('prepends new categories (newest first)', async () => {
    await service.addCategory({ name: 'First' });
    const categories = await service.addCategory({ name: 'Second' });
    expect(categories.map((c) => c.name)).toEqual(['Second', 'First']);
  });

  it('updates a category (name + color + icon) and bumps updatedAt', async () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-01-01T00:00:00.000Z'));
    const [created] = await service.addCategory({ name: 'Old', color: '#fff' });
    jasmine.clock().tick(1000);
    const updated = await service.updateCategory(created.id, {
      name: 'New',
      color: '#000',
      icon: 'home-outline',
    });
    jasmine.clock().uninstall();
    expect(updated[0].name).toBe('New');
    expect(updated[0].color).toBe('#000');
    expect(updated[0].icon).toBe('home-outline');
    expect(updated[0].updatedAt).not.toBe(created.updatedAt);
  });

  it('deletes a category by id', async () => {
    const [a] = await service.addCategory({ name: 'A' });
    await service.addCategory({ name: 'B' });
    const result = await service.deleteCategory(a.id);
    expect(result.map((c) => c.name)).toEqual(['B']);
  });
});
