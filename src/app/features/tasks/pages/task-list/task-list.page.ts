import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  AlertController,
  IonCheckbox,
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
import { addOutline, checkmarkDoneOutline, trashOutline } from 'ionicons/icons';
import { Task } from '../../../../core/models';
import { TaskStateService } from '../../../../core/services/task-state.service';

/**
 * Home / task list page.
 *
 * Functional baseline (Phase 4): lists tasks from the reactive store, adds via a
 * prompt, toggles completion, and deletes with confirmation — all persisted
 * locally. The premium visual layer (cards, animations, custom add sheet) lands
 * in Phase 6 and the category filter in Phase 5.
 */
@Component({
  selector: 'tb-task-list',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonCheckbox,
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
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  /** Reactive view-model surfaced to the template. */
  readonly tasks = this.store.filteredTasks;
  readonly stats = this.store.stats;
  readonly loading = this.store.loading;
  readonly isEmpty = this.store.isEmpty;

  constructor() {
    addIcons({ addOutline, trashOutline, checkmarkDoneOutline });
  }

  ngOnInit(): void {
    void this.store.load();
  }

  /** Stable identity for the list to avoid re-rendering unchanged rows. */
  trackById(_index: number, task: Task): string {
    return task.id;
  }

  async toggle(task: Task): Promise<void> {
    await this.store.toggleCompleted(task.id);
  }

  /** Prompt for a title and create a task. */
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
    await this.store.addTask({ title });
    await this.showToast('Task added');
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
