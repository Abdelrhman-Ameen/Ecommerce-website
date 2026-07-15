import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';
import { ApiErrorBody } from './models';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req.clone({ withCredentials: true })).pipe(
    catchError((error: HttpErrorResponse) => {
      const body = error.error as ApiErrorBody | undefined;
      const message = body?.details?.[0]?.message || body?.message || 'We could not complete that request.';
      if (error.status !== 401 || !req.url.endsWith('/auth/me')) toast.error(message);
      return throwError(() => error);
    }),
  );
};
