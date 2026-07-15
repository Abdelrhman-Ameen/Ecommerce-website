import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureSession().pipe(map((user) => user ? true : router.createUrlTree(['/login'], { queryParams: { redirect: state.url } })));
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureSession().pipe(map((user) => user?.role === 'admin' ? true : router.createUrlTree(['/login'], { queryParams: { redirect: '/admin' } })));
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureSession().pipe(map((user) => user ? router.createUrlTree([user.role === 'admin' ? '/admin' : '/account']) : true));
};
