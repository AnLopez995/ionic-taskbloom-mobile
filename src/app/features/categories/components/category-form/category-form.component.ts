import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../../../core/constants/app.constants';
import { Category } from '../../../../core/models';
import { registerCategoryIcons } from '../../../../core/utils/icons.util';

/** Result returned to the opener when the form is saved. */
export interface CategoryFormResult {
  name: string;
  color: string;
  icon: string;
}

/**
 * Create / edit a category (name + color + icon) in a bottom sheet.
 *
 * Opened via `ModalController` so the `category` to edit can be passed through
 * `componentProps` and is available before init (no inline-modal binding timing
 * issues). Dismisses with a {@link CategoryFormResult} on save, or null on cancel.
 */
@Component({
  selector: 'tb-category-form',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private readonly modalCtrl = inject(ModalController);

  /** Set via `componentProps` when editing; undefined when creating. */
  category?: Category;

  protected readonly colors = CATEGORY_COLORS;
  protected readonly icons = CATEGORY_ICONS;

  protected readonly isEdit = signal(false);
  protected readonly name = signal('');
  protected readonly selectedColor = signal<string>(CATEGORY_COLORS[0]);
  protected readonly selectedIcon = signal<string>(CATEGORY_ICONS[0]);
  protected readonly canSave = computed(() => this.name().trim().length > 0);

  constructor() {
    registerCategoryIcons();
  }

  ngOnInit(): void {
    if (this.category) {
      this.isEdit.set(true);
      this.name.set(this.category.name);
      this.selectedColor.set(this.category.color ?? CATEGORY_COLORS[0]);
      this.selectedIcon.set(this.category.icon ?? CATEGORY_ICONS[0]);
    }
  }

  protected onNameInput(value: string | null | undefined): void {
    this.name.set(value ?? '');
  }

  protected pickColor(color: string): void {
    this.selectedColor.set(color);
  }

  protected pickIcon(icon: string): void {
    this.selectedIcon.set(icon);
  }

  protected save(): void {
    const name = this.name().trim();
    if (!name) {
      return;
    }
    const result: CategoryFormResult = {
      name,
      color: this.selectedColor(),
      icon: this.selectedIcon(),
    };
    void this.modalCtrl.dismiss(result, 'save');
  }

  protected dismiss(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }
}
