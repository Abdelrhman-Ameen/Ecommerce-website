import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { LanguageService } from '../core/language.service';
import { ThemeService } from '../core/theme.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="auth-page"><div class="auth-controls"><button class="theme-switch" type="button" (click)="theme.toggle()" [attr.aria-label]="(theme.theme() === 'light' ? 'Enable dark mode' : 'Enable light mode') | translate"><i class="bi" [class.bi-moon-stars]="theme.theme() === 'light'" [class.bi-sun]="theme.theme() === 'dark'"></i></button><button class="language-switch" type="button" (click)="language.toggle()">{{ language.language() === 'en' ? 'عربي' : 'EN' }}</button></div><div class="auth-card"><div class="auth-brand-icon"><i class="bi bi-stars"></i></div><a class="brand-mark justify-content-center mb-1" routerLink="/">Vellora</a><h1>{{ 'Sign in' | translate }}</h1><p>{{ 'Welcome back. Enter your details to continue.' | translate }}</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-group-luxe"><label for="email">{{ 'Email address' | translate }}</label><div class="input-with-icon"><i class="bi bi-envelope"></i><input id="email" type="email" formControlName="email" autocomplete="email" placeholder="you@example.com" [class.is-invalid]="invalid('email')"></div>@if (invalid('email')) { <small>{{ 'Enter a valid email address.' | translate }}</small> }</div>
        <div class="form-group-luxe"><div class="d-flex justify-content-between"><label for="password">{{ 'Password' | translate }}</label><a routerLink="/info/contact">{{ 'Need help?' | translate }}</a></div><div class="input-with-icon"><i class="bi bi-lock"></i><input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" placeholder="••••••••••" [class.is-invalid]="invalid('password')"><button type="button" (click)="showPassword.update(v => !v)" [attr.aria-label]="'Toggle password visibility' | translate"><i class="bi" [class.bi-eye]="!showPassword()" [class.bi-eye-slash]="showPassword()"></i></button></div>@if (invalid('password')) { <small>{{ 'Password is required.' | translate }}</small> }</div>
        <button class="btn btn-primary-luxe w-100 mt-2" type="submit" [disabled]="submitting()">@if (submitting()) { <span class="spinner-border spinner-border-sm me-2"></span> }{{ 'Sign in' | translate }} <i class="bi bi-arrow-right ms-2"></i></button>
      </form><div class="auth-divider"><span>{{ 'or' | translate }}</span></div><p class="mb-0">{{ 'New to Vellora?' | translate }} <a routerLink="/register">{{ 'Create account' | translate }}</a></p>
    </div><p class="auth-security"><i class="bi bi-shield-lock"></i> {{ 'Secure, encrypted session' | translate }} · <a routerLink="/info/privacy">{{ 'Privacy policy' | translate }}</a></p></section>
  `,
})
export class LoginComponent {
  readonly submitting = signal(false); readonly showPassword = signal(false); readonly form;
  constructor(fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute, public language: LanguageService, public theme: ThemeService) {
    this.form = fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  }
  invalid(name: 'email' | 'password'): boolean { const control = this.form.controls[name]; return control.invalid && (control.touched || this.form.touched); }
  submit(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.submitting.set(true); this.auth.login(this.form.getRawValue()).subscribe({ next: (user) => { const redirect = this.route.snapshot.queryParamMap.get('redirect'); this.router.navigateByUrl(redirect || (user.role === 'admin' ? '/admin' : '/account')); }, error: () => this.submitting.set(false) }); }
}
