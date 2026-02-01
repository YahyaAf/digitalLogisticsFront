import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const loginGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est déjà authentifié (signal OU token)
  const hasToken = !!authService.getToken();
  const isAuth = authService.isAuthenticated() || hasToken;
  
  // Si l'utilisateur est déjà authentifié, rediriger vers la page appropriée
  if (isAuth) {
    // Charger currentUser si pas encore fait
    if (!authService.currentUser() && hasToken) {
      console.log('loginGuard: Loading currentUser...');
      try {
        await firstValueFrom(authService.getCurrentUser());
      } catch (error) {
        console.error('loginGuard: Error loading currentUser', error);
      }
    }
    
    const userRole = authService.getUserRole();
    console.log('loginGuard: User is authenticated, role:', userRole);
    
    if (userRole === 'CLIENT') {
      console.log('loginGuard: Redirecting CLIENT to /');
      router.navigate(['/']);
      return false;
    } else if (userRole === 'ADMIN' || userRole === 'WAREHOUSE_MANAGER') {
      console.log('loginGuard: Redirecting', userRole, 'to /dashboard');
      router.navigate(['/dashboard']);
      return false;
    } else {
      // Si le rôle n'est pas encore déterminé, rediriger vers home par défaut
      console.log('loginGuard: Unknown role, redirecting to /');
      router.navigate(['/']);
      return false;
    }
  }

  // Sinon, permettre l'accès à la page de login
  return true;
};
