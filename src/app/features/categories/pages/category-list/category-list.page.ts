import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  AlertController,
  IonBackButton,
  IonButtons,
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
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, pricetagsOutline, trashOutline } from 'ionicons/icons';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../../../core/constants/app.constants';
import { Category } from '../../../../core/models';
import { CategoryStateService } from '../../../../core/services/category-state.service';

/**
 * Category management page (Phase 5): list / create / edit / delete categories,
 * each with a live task counter. Deleting a category detaches it from its tasks.
 *
 * Create/edit use a name prompt as the functional baseline; color + icon are
 * auto-assigned by cycling the brand palette. The full color/icon picker is a
 * Phase 6 (premium UI) concern.
 */
@Component({
  selector: 'tb-category-list',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonNote,
    IonIcon,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-list.page.html',
  styleUrl: './category-list.page.scss',
})
export class CategoryListPage implements OnInit {
  private readonly store = inject(CategoryStateService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  readonly categories = this.store.categories;
  readonly counts = this.store.taskCountByCategory;
  readonly loading = this.store.loading;
  readonly isEmpty = this.store.isEmpty;

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, pricetagsOutline });
  }

  ngOnInit(): void {
    void this.store.load();
  }

  trackById(_index: number, category: Category): string {
    return category.id;
  }

  /** Live task count for a category (0 when none are assigned). */
  taskCount(category: Category): number {
    return this.counts()[category.id] ?? 0;
  }

  /** Prompt for a name and create a category with an auto-assigned color/icon. */
  async promptCreate(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'New category',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'e.g. Work, Personal, Health',
          attributes: { maxlength: 40, autocapitalize: 'sentences' },
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          role: 'confirm',
          handler: (data: { name?: string }) => {
            const name = (data.name ?? '').trim();
            if (!name) {
              return false;
            }
            void this.createCategory(name);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async createCategory(name: string): Promise<void> {
    // Cycle the brand palette/icons so each new category gets a distinct look.
    const index = this.categories().length;
    await this.store.addCategory({
      name,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
    });
    await this.showToast('Category created');
  }

  /** Prompt to rename an existing category. */
  async promptRename(category: Category): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Rename category',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: category.name,
          attributes: { maxlength: 40, autocapitalize: 'sentences' },
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          role: 'confirm',
          handler: (data: { name?: string }) => {
            const name = (data.name ?? '').trim();
            if (!name) {
              return false;
            }
            void this.store.updateCategory(category.id, { name });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  /** Confirm, then delete (cascades: detaches the category from its tasks). */
  async confirmDelete(category: Category): Promise<void> {
    const count = this.counts()[category.id] ?? 0;
    const note =
      count > 0
        ? ` ${count} task${count === 1 ? '' : 's'} will keep their data but become uncategorized.`
        : '';
    const alert = await this.alertCtrl.create({
      header: 'Delete category',
      message: `"${category.name}" will be removed.${note}`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteCategory(category);
          },
        },
      ],
    });
    await alert.present();
  }

  private async deleteCategory(category: Category): Promise<void> {
    await this.store.deleteCategory(category.id);
    await this.showToast('Category deleted');
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 1500, position: 'bottom' });
    await toast.present();
  }
}
