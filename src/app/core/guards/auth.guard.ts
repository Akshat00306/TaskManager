import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protects app pages: must be logged in with a valid (non-expired) token. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasValidSession()) {
    return true;
  }

  // Session ended or never started — only then go to login
  auth.clearSession();
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * Login / register only: guests may enter.
 * If already logged in, keep them inside the app (dashboard) — do not show login again.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasValidSession()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
