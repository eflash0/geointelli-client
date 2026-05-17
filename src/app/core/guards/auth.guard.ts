import { inject } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../auth/keycloak.service';

export const authGuard: CanActivateFn = async () => {
  return true;
  const keycloak = inject(KeycloakService);

  if (keycloak.isLoggedIn()) {
    return true;
  }

  await keycloak.login();
  return false;
};