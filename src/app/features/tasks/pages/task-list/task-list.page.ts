import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

/**
 * Home / task list page.
 *
 * Placeholder for Phase 3 (architecture wiring). Task CRUD + reactive state are
 * implemented in Phase 4, and the premium UI in Phase 6.
 */
@Component({
  selector: 'tb-task-list',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>TaskBloom</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Tasks coming in Phase 4.</p>
    </ion-content>
  `,
})
export class TaskListPage {}
