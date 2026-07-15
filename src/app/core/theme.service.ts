import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>(this.initialTheme());

  constructor() { this.apply(this.theme()); }

  toggle(): void { this.set(this.theme() === 'light' ? 'dark' : 'light'); }

  set(theme: AppTheme): void {
    this.theme.set(theme);
    localStorage.setItem('ma3rad-theme', theme);
    this.apply(theme);
  }

  private initialTheme(): AppTheme {
    const saved = localStorage.getItem('ma3rad-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(theme: AppTheme): void {
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.style.colorScheme = theme;
  }
}
