import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonProgressBar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  checkmarkDoneOutline,
  pricetagOutline,
  pricetagsOutline,
  trashOutline,
} from 'ionicons/icons';
import { ALL_CATEGORIES } from '../../../../core/constants/app.constants';
import { Category, Task } from '../../../../core/models';
import { CategoryStateService } from '../../../../core/services/category-state.service';
import { TaskStateService } from '../../../../core/services/task-state.service';

/**
 * Home / task list page.
 *
 * Lists tasks from the reactive store with a category filter (Phase 5), adds via
 * a prompt, toggles completion, assigns categories, and deletes with confirmation
 * — all persisted locally. The premium visual layer (cards, animations, custom
 * add sheet) lands in Phase 6.
 */
@Component({
  selector: 'tb-task-list',
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonCheckbox,
    IonChip,
    IonIcon,
    IonFab,
    IonFabButton,
    IonProgressBar,
    IonSpinner,
    IonText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-list.page.html',
  styleUrl: './task-list.page.scss',
})
export class TaskListPage implements OnInit {
  private readonly store = inject(TaskStateService);
  private readonly categoryStore = inject(CategoryStateService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly allCategories = ALL_CATEGORIES;

  /** Reactive view-model surfaced to the template. */
  readonly tasks = this.store.filteredTasks;
  readonly stats = this.store.stats;
  readonly loading = this.store.loading;
  readonly isEmpty = this.store.isEmpty;
  readonly selectedCategoryId = this.store.selectedCategoryId;
  readonly categories = this.categoryStore.categories;

  /** Fast id → category lookup so each task row can render its category chip. */
  private readonly categoriesById = computed<Map<string, Category>>(
    () => new Map(this.categoryStore.categories().map((category) => [category.id, category])),
  );

  constructor() {
    addIcons({
      addOutline,
      trashOutline,
      checkmarkDoneOutline,
      pricetagOutline,
      pricetagsOutline,
    });
  }

  ngOnInit(): void {
    void this.store.load();
    void this.categoryStore.load();
  }

  /** Stable identity for the list to avoid re-rendering unchanged rows. */
  trackById(_index: number, task: Task): string {
    return task.id;
  }

  /** The category assigned to a task, or undefined when uncategorized. */
  categoryOf(task: Task): Category | undefined {
    return task.categoryId ? this.categoriesById().get(task.categoryId) : undefined;
  }

  /** Apply a category filter from the chip row. */
  filterBy(categoryId: string): void {
    this.store.setCategoryFilter(categoryId);
  }

  async toggle(task: Task): Promise<void> {
    await this.store.toggleCompleted(task.id);
  }

  /** Prompt for a title and create a task (in the active category, if any). */
  async promptAdd(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'New task',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'What do you want to get done?',
          attributes: { maxlength: 120, autocapitalize: 'sentences' },
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          role: 'confirm',
          handler: (data: { title?: string }) => {
            const title = (data.title ?? '').trim();
            if (!title) {
              return false;
            }
            void this.addTask(title);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async addTask(title: string): Promise<void> {
    // Pre-fill the active filter as the category so adding within a filtered
    // view lands the task where the user is looking.
    const active = this.selectedCategoryId();
    const categoryId = active === ALL_CATEGORIES ? null : active;
    await this.store.addTask({ title, categoryId });
    await this.showToast('Task added');
  }

  /** Radio picker to assign (or clear) a task's category. */
  async promptAssignCategory(task: Task): Promise<void> {
    const categories = this.categories();
    const alert = await this.alertCtrl.create({
      header: 'Assign category',
      inputs: [
        {
          type: 'radio',
          label: 'None',
          value: '',
          checked: !task.categoryId,
        },
        ...categories.map((category) => ({
          type: 'radio' as const,
          label: category.name,
          value: category.id,
          checked: task.categoryId === category.id,
        })),
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          role: 'confirm',
          handler: (value: string) => {
            void this.store.assignCategory(task.id, value || null);
          },
        },
      ],
    });
    await alert.present();
  }

  /** Confirm, then delete. */
  async confirmDelete(task: Task): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Delete task',
      message: `"${task.title}" will be permanently removed.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteTask(task.id);
          },
        },
      ],
    });
    await alert.present();
  }

  private async deleteTask(id: string): Promise<void> {
    await this.store.deleteTask(id);
    await this.showToast('Task deleted');
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
}
