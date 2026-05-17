import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../auth/keycloak.service';

export const authGuard: CanActivateFn = async () => {
  return true;
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  if (!keycloak.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/map']);
};
