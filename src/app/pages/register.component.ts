import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { LanguageService } from '../core/language.service';
import { ThemeService } from '../core/theme.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="auth-page auth-page-wide"><div class="auth-controls"><button class="theme-switch" type="button" (click)="theme.toggle()" [attr.aria-label]="(theme.theme() === 'light' ? 'Enable dark mode' : 'Enable light mode') | translate"><i class="bi" [class.bi-moon-stars]="theme.theme() === 'light'" [class.bi-sun]="theme.theme() === 'dark'"></i></button><button class="language-switch" type="button" (click)="language.toggle()">{{ language.language() === 'en' ? 'عربي' : 'EN' }}</button></div><div class="auth-card"><a class="auth-logo" routerLink="/"><img src="/assets/brand/vellora-logo.png" alt="Vellora"></a><h1>{{ 'Create account' | translate }}</h1><p>{{ 'Save favorites, checkout faster, and follow every order.' | translate }}</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate><div class="row g-3"><div class="col-sm-6"><div class="form-group-luxe"><label for="firstName">{{ 'First name' | translate }}</label><input id="firstName" class="form-control" formControlName="firstName" autocomplete="given-name" [class.is-invalid]="invalid('firstName')"></div></div><div class="col-sm-6"><div class="form-group-luxe"><label for="lastName">{{ 'Last name' | translate }}</label><input id="lastName" class="form-control" formControlName="lastName" autocomplete="family-name" [class.is-invalid]="invalid('lastName')"></div></div></div>
        <div class="form-group-luxe"><label for="email">{{ 'Email address' | translate }}</label><input id="email" class="form-control" type="email" formControlName="email" autocomplete="email" [class.is-invalid]="invalid('email')"></div>
        <div class="form-group-luxe"><label for="phone">{{ 'Phone number' | translate }} <span>({{ 'optional' | translate }})</span></label><input id="phone" class="form-control" type="tel" formControlName="phone" autocomplete="tel" placeholder="+201000000000" [class.is-invalid]="invalid('phone')"></div>
        <div class="form-group-luxe"><label for="password">{{ 'Password' | translate }}</label><input id="password" class="form-control" type="password" formControlName="password" autocomplete="new-password" [class.is-invalid]="invalid('password')"><small class="form-hint">{{ '10+ characters with uppercase, lowercase, number, and symbol.' | translate }}</small></div>
        <label class="form-check mb-4"><input class="form-check-input" type="checkbox" formControlName="accepted"><span class="form-check-label">{{ 'I agree to the' | translate }} <a routerLink="/info/terms">{{ 'terms' | translate }}</a> {{ 'and' | translate }} <a routerLink="/info/privacy">{{ 'privacy policy' | translate }}</a>.</span></label>
        <button class="btn btn-primary-luxe w-100" type="submit" [disabled]="submitting()">@if (submitting()) { <span class="spinner-border spinner-border-sm me-2"></span> }{{ 'Create account' | translate }}</button>
      </form><p class="mt-4 mb-0">{{ 'Already have an account?' | translate }} <a routerLink="/login">{{ 'Sign in' | translate }}</a></p></div></section>
  `,
})
export class RegisterComponent {
  readonly submitting = signal(false); readonly form;
  constructor(fb: FormBuilder, private auth: AuthService, private router: Router, public language: LanguageService, public theme: ThemeService) {
    this.form = fb.nonNullable.group({ firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]], lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]], email: ['', [Validators.required, Validators.email]], phone: ['', Validators.pattern(/^\+?[0-9]{10,15}$/)], password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,72}$/)]], accepted: [false, Validators.requiredTrue] });
  }
  invalid(name: keyof typeof this.form.controls): boolean { const control = this.form.controls[name]; return control.invalid && (control.touched || this.form.touched); }
  submit(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } const { accepted, ...payload } = this.form.getRawValue(); this.submitting.set(true); this.auth.register(payload).subscribe({ next: () => this.router.navigate(['/products']), error: () => this.submitting.set(false) }); }
}
