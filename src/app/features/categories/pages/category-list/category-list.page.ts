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
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, pricetagsOutline, trashOutline } from 'ionicons/icons';
import { Category } from '../../../../core/models';
import { CategoryStateService } from '../../../../core/services/category-state.service';
import { registerCategoryIcons } from '../../../../core/utils/icons.util';
import {
  CategoryFormComponent,
  CategoryFormResult,
} from '../../components/category-form/category-form.component';

/**
 * Category management page: list / create / edit / delete categories, each with a
 * live task counter. Deleting a category detaches it from its tasks.
 *
 * Create and edit open the {@link CategoryFormComponent} bottom sheet (name +
 * color + icon picker). Delete uses a confirm alert.
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
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);

  readonly categories = this.store.categories;
  readonly counts = this.store.taskCountByCategory;
  readonly loading = this.store.loading;
  readonly isEmpty = this.store.isEmpty;

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, pricetagsOutline });
    registerCategoryIcons();
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

  /** Open the create sheet. */
  async openCreate(): Promise<void> {
    await this.openForm();
  }

  /** Open the edit sheet pre-filled with the given category. */
  async openEdit(category: Category): Promise<void> {
    await this.openForm(category);
  }

  /** Present the category form sheet and persist the result, if saved. */
  private async openForm(category?: Category): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CategoryFormComponent,
      componentProps: { category },
      initialBreakpoint: 0.85,
      breakpoints: [0, 0.85, 1],
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss<CategoryFormResult>();
    if (role !== 'save' || !data) {
      return;
    }
    if (category) {
      await this.store.updateCategory(category.id, data);
      await this.showToast('Category updated');
    } else {
      await this.store.addCategory(data);
      await this.showToast('Category created');
    }
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
