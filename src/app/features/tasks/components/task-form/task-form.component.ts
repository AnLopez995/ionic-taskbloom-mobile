import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ALL_CATEGORIES } from '../../../../core/constants/app.constants';
import { CategoryStateService } from '../../../../core/services/category-state.service';
import { TaskStateService } from '../../../../core/services/task-state.service';
import { registerCategoryIcons } from '../../../../core/utils/icons.util';

/** Payload emitted when a task is submitted. */
export interface TaskFormResult {
  title: string;
  categoryId: string | null;
}

/**
 * Add-task bottom sheet (Phase 6). Owns its own draft state and emits a
 * {@link TaskFormResult} on save — the parent decides how to persist and when to
 * dismiss. Save stays disabled until the title is non-empty (inline validation).
 *
 * It reads categories straight from {@link CategoryStateService} rather than via
 * `@Input`, because `ion-modal` stamps its inline template into a detached
 * OnPush overlay where signal-input bindings can miss the first change-detection
 * pass. Reading the store directly is synchronous and reliable.
 */
@Component({
  selector: 'tb-task-form',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonChip,
    IonLabel,
    IonIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  private readonly categoryStore = inject(CategoryStateService);
  private readonly taskStore = inject(TaskStateService);

  readonly saved = output<TaskFormResult>();
  readonly cancelled = output<void>();

  /** Categories offered in the selector. */
  protected readonly categories = this.categoryStore.categories;

  protected readonly title = signal('');
  // Defaults to the active filter, but stays writable so the user can change it.
  protected readonly selectedCategoryId = linkedSignal(() => {
    const active = this.taskStore.selectedCategoryId();
    return active === ALL_CATEGORIES ? null : active;
  });
  protected readonly canSave = computed(() => this.title().trim().length > 0);

  constructor() {
    registerCategoryIcons();
  }

  protected onTitleInput(value: string | null | undefined): void {
    this.title.set(value ?? '');
  }

  protected pick(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  protected submit(): void {
    const title = this.title().trim();
    if (!title) {
      return;
    }
    this.saved.emit({ title, categoryId: this.selectedCategoryId() });
  }

  protected dismiss(): void {
    this.cancelled.emit();
  }
}
