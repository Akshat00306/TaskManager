import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const isAuthEndpoint =
    req.url.includes('/auth/login') || req.url.includes('/auth/register');

  const authReq =
    token && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only end the session when the API rejects the Bearer token itself.
      // Do not log out on business errors, network blips, or login failures.
      if (
        error.status === 401 &&
        token &&
        !isAuthEndpoint &&
        !req.url.includes('/auth/login')
      ) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
