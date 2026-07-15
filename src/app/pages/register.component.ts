import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AuthShowcaseComponent } from '../shared/auth-showcase.component';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, AuthShowcaseComponent],
  template: `
    <app-auth-showcase variant="register">
      <article class="auth-form-card auth-register-card">
        <div class="auth-form-heading">
          <span>{{ '02 / NEW MEMBERSHIP' | translate }}</span>
          <h2>{{ 'Create your account' | translate }}</h2>
          <p>{{ 'Save the pieces you love and move through checkout with ease.' | translate }}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="auth-field-grid">
            <div class="form-group-luxe">
              <label for="firstName">{{ 'First name' | translate }}</label>
              <div class="auth-input-wrap"><i class="bi bi-person"></i><input id="firstName" formControlName="firstName" autocomplete="given-name" [class.is-invalid]="invalid('firstName')"></div>
            </div>
            <div class="form-group-luxe">
              <label for="lastName">{{ 'Last name' | translate }}</label>
              <div class="auth-input-wrap"><i class="bi bi-person"></i><input id="lastName" formControlName="lastName" autocomplete="family-name" [class.is-invalid]="invalid('lastName')"></div>
            </div>
          </div>

          <div class="auth-field-grid">
            <div class="form-group-luxe">
              <label for="email">{{ 'Email address' | translate }}</label>
              <div class="auth-input-wrap"><i class="bi bi-envelope"></i><input id="email" type="email" formControlName="email" autocomplete="email" [class.is-invalid]="invalid('email')"></div>
            </div>
            <div class="form-group-luxe">
              <label for="phone">{{ 'Phone number' | translate }} <span>({{ 'optional' | translate }})</span></label>
              <div class="auth-input-wrap"><i class="bi bi-phone"></i><input id="phone" type="tel" formControlName="phone" autocomplete="tel" placeholder="+201000000000" [class.is-invalid]="invalid('phone')"></div>
            </div>
          </div>

          <div class="form-group-luxe">
            <label for="password">{{ 'Password' | translate }}</label>
            <div class="auth-input-wrap">
              <i class="bi bi-lock"></i>
              <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="new-password" [class.is-invalid]="invalid('password')">
              <button type="button" (click)="showPassword.update(value => !value)" [attr.aria-label]="'Toggle password visibility' | translate"><i class="bi" [class.bi-eye]="!showPassword()" [class.bi-eye-slash]="showPassword()"></i></button>
            </div>
            <small class="form-hint">{{ '10+ characters with uppercase, lowercase, number, and symbol.' | translate }}</small>
          </div>

          <label class="auth-consent">
            <input class="form-check-input" type="checkbox" formControlName="accepted">
            <span>{{ 'I agree to the' | translate }} <a routerLink="/info/terms">{{ 'terms' | translate }}</a> {{ 'and' | translate }} <a routerLink="/info/privacy">{{ 'privacy policy' | translate }}</a>.</span>
          </label>

          <button class="auth-submit-button" type="submit" [disabled]="submitting()">
            <span>@if (submitting()) { <span class="spinner-border spinner-border-sm"></span> }{{ 'Create account' | translate }}</span>
            <i class="bi bi-arrow-right"></i>
          </button>
        </form>

        <div class="auth-form-switch auth-form-switch-compact">
          <span>{{ 'Already have an account?' | translate }}</span>
          <a routerLink="/login">{{ 'Sign in' | translate }} <i class="bi bi-arrow-up-right"></i></a>
        </div>
      </article>
    </app-auth-showcase>
  `,
})
export class RegisterComponent {
  readonly submitting = signal(false);
  readonly showPassword = signal(false);
  readonly form;

  constructor(fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^\+?[0-9]{10,15}$/)],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,72}$/)]],
      accepted: [false, Validators.requiredTrue],
    });
  }

  invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.form.touched);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { accepted, ...payload } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => this.submitting.set(false),
    });
  }
}
