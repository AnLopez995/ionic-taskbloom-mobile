import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

/** How long the splash lingers before handing off to the task list. */
const SPLASH_DURATION_MS = 2200;

/**
 * Splash / brand screen.
 *
 * Shows the animated "bloom" mark, wordmark and tagline, then auto-advances to
 * the task list. The timer is cleared on destroy so navigating away early never
 * fires a late redirect (Phase 6, frontend-design).
 */
@Component({
  selector: 'tb-splash',
  standalone: true,
  imports: [IonContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splash.page.html',
  styleUrl: './splash.page.scss',
})
export class SplashPage implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Rotation (deg) for each of the six bloom petals. */
  readonly petalAngles = [0, 60, 120, 180, 240, 300];

  ngOnInit(): void {
    this.timer = setTimeout(() => {
      void this.router.navigate(['/tasks'], { replaceUrl: true });
    }, SPLASH_DURATION_MS);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
