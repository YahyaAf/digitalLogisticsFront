import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié (signal OU token)
  const hasToken = !!authService.getToken();
  if (!authService.isAuthenticated() && !hasToken) {
    console.log('roleGuard: Not authenticated');
    router.navigate(['/login']);
    return false;
  }
  
  // Mettre à jour le signal si on a un token
  if (hasToken && !authService.isAuthenticated()) {
    authService.isAuthenticated.set(true);
  }

  // Récupérer les rôles requis depuis la route
  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Si currentUser n'est pas encore chargé, le charger maintenant
  if (!authService.currentUser()) {
    console.log('roleGuard: currentUser not loaded, loading now...');
    try {
      const response = await firstValueFrom(authService.getCurrentUser());
      if (response && response.success) {
        console.log('roleGuard: currentUser loaded successfully');
      }
    } catch (error) {
      console.error('roleGuard: Error loading currentUser', error);
      router.navigate(['/login']);
      return false;
    }
  }

  // Récupérer le rôle de l'utilisateur depuis currentUser (pas depuis JWT)
  const userRole = authService.getUserRole();
  
  if (!userRole) {
    console.warn('roleGuard: No role found even after loading currentUser');
    router.navigate(['/']);
    return false;
  }
  
  console.log('roleGuard: User role:', userRole, '| Required roles:', requiredRoles);

  // Vérifier si l'utilisateur a l'un des rôles requis
  const hasRole = requiredRoles.includes(userRole);
  
  if (!hasRole) {
    console.log('roleGuard: ❌ Access denied. Redirecting...');
    // Rediriger vers la page appropriée selon le rôle
    if (userRole === 'CLIENT') {
      router.navigate(['/']);
    } else {
      router.navigate(['/dashboard']);
    }
    return false;
  }

  console.log('roleGuard: ✅ Access granted');
  return true;
};
