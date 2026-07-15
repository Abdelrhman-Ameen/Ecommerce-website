import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AuthShowcaseComponent } from '../shared/auth-showcase.component';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, AuthShowcaseComponent],
  template: `
    <app-auth-showcase variant="login">
      <article class="auth-form-card">
        <div class="auth-form-heading">
          <span>{{ '01 / MEMBER ACCESS' | translate }}</span>
          <h2>{{ 'Welcome back' | translate }}</h2>
          <p>{{ 'Enter your details to continue your Vellora edit.' | translate }}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="form-group-luxe">
            <label for="email">{{ 'Email address' | translate }}</label>
            <div class="auth-input-wrap">
              <i class="bi bi-envelope"></i>
              <input id="email" type="email" formControlName="email" autocomplete="email" placeholder="you@example.com" [class.is-invalid]="invalid('email')">
            </div>
            @if (invalid('email')) { <small>{{ 'Enter a valid email address.' | translate }}</small> }
          </div>

          <div class="form-group-luxe">
            <div class="auth-label-row">
              <label for="password">{{ 'Password' | translate }}</label>
              <a routerLink="/support">{{ 'Need help?' | translate }}</a>
            </div>
            <div class="auth-input-wrap">
              <i class="bi bi-lock"></i>
              <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" placeholder="••••••••••" [class.is-invalid]="invalid('password')">
              <button type="button" (click)="showPassword.update(value => !value)" [attr.aria-label]="'Toggle password visibility' | translate">
                <i class="bi" [class.bi-eye]="!showPassword()" [class.bi-eye-slash]="showPassword()"></i>
              </button>
            </div>
            @if (invalid('password')) { <small>{{ 'Password is required.' | translate }}</small> }
          </div>

          <button class="auth-submit-button" type="submit" [disabled]="submitting()">
            <span>@if (submitting()) { <span class="spinner-border spinner-border-sm"></span> }{{ 'Sign in' | translate }}</span>
            <i class="bi bi-arrow-right"></i>
          </button>
        </form>

        <div class="auth-form-switch">
          <span>{{ 'New to Vellora?' | translate }}</span>
          <a routerLink="/register">{{ 'Create account' | translate }} <i class="bi bi-arrow-up-right"></i></a>
        </div>
        <p class="auth-security-note"><i class="bi bi-shield-lock"></i>{{ 'Secure, encrypted session' | translate }} · <a routerLink="/info/privacy">{{ 'Privacy policy' | translate }}</a></p>
      </article>
    </app-auth-showcase>
  `,
})
export class LoginComponent {
  readonly submitting = signal(false);
  readonly showPassword = signal(false);
  readonly form;

  constructor(fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.form = fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  }

  invalid(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.form.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (user) => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirect || (user.role === 'admin' ? '/admin' : '/account'));
      },
      error: () => this.submitting.set(false),
    });
  }
}
