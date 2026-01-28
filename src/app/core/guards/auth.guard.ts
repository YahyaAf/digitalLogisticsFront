import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié via le signal
  if (authService.isAuthenticated()) {
    return true;
  }

  // Vérifier aussi directement le token dans localStorage
  const token = authService.getToken();
  if (token) {
    authService.isAuthenticated.set(true);
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
