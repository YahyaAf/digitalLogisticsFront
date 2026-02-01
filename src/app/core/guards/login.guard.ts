import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est déjà authentifié (signal OU token)
  const hasToken = !!authService.getToken();
  const isAuth = authService.isAuthenticated() || hasToken;
  
  // Si l'utilisateur est déjà authentifié, rediriger vers la page appropriée
  if (isAuth) {
    const userRole = authService.getUserRole();
    
    if (userRole === 'CLIENT') {
      router.navigate(['/']);
      return false;
    } else if (userRole === 'ADMIN' || userRole === 'WAREHOUSE_MANAGER') {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  // Sinon, permettre l'accès à la page de login
  return true;
};
