import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

/**
 * Splash / splash-art screen.
 *
 * Placeholder for Phase 3 — the animated bloom art, tagline and timed redirect
 * to the task list are implemented in Phase 6 (UI/UX).
 */
@Component({
  selector: 'tb-splash',
  standalone: true,
  imports: [IonContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-content class="ion-padding ion-text-center">
      <h1>TaskBloom</h1>
      <p>Organize your day with clarity</p>
    </ion-content>
  `,
})
export class SplashPage {}
