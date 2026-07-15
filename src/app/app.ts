import { AfterViewInit, ApplicationRef, Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import { ToastComponent } from './shared/toast.component';
import { AuthService } from './core/auth.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit {
  readonly initialLoading = signal(true);
  readonly loaderLeaving = signal(false);

  constructor(private auth: AuthService, private theme: ThemeService, private application: ApplicationRef) {}
  ngOnInit(): void { this.auth.ensureSession().subscribe(); }

  async ngAfterViewInit(): Promise<void> {
    const startedAt = performance.now();
    await Promise.race([this.waitUntilReady(), this.delay(1700)]);
    await this.delay(Math.max(0, 500 - (performance.now() - startedAt)));
    this.loaderLeaving.set(true);
    await this.delay(360);
    this.initialLoading.set(false);
  }

  private async waitUntilReady(): Promise<void> {
    await firstValueFrom(this.application.isStable.pipe(filter(Boolean), take(1)));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const eagerImages = Array.from(document.images).filter((image) => image.loading !== 'lazy');
    const imageReady = Promise.all(eagerImages.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    })));
    await Promise.all([document.fonts?.ready || Promise.resolve(), imageReady]);
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }
}
