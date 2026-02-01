import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
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
    
    // Forcer le chargement de currentUser si pas encore fait
    if (!authService.currentUser()) {
      console.log('authGuard: Token exists but currentUser not loaded, loading now...');
      try {
        const response = await firstValueFrom(authService.getCurrentUser());
        if (response && response.success) {
          console.log('authGuard: currentUser loaded successfully');
          return true;
        }
        console.warn('authGuard: Failed to load currentUser');
        return true; // Permettre l'accès quand même si le token est valide
      } catch (error: any) {
        console.error('authGuard: Error loading currentUser', error);
        // Si erreur 401, déconnecter
        if (error.status === 401) {
          authService.isAuthenticated.set(false);
          authService.currentUser.set(null);
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        return true; // Permettre l'accès pour autres erreurs
      }
    }
    
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
