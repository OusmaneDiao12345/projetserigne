import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const paidAccessGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin() || auth.hasPlatformAccess()) {
    return true;
  }
  return router.createUrlTree(['/adhesion'], { queryParams: { need: 'paiement' } });
};
