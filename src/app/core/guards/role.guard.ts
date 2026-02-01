import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
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

  // Récupérer le rôle de l'utilisateur depuis currentUser (pas depuis JWT)
  const userRole = authService.getUserRole();
  
  if (!userRole) {
    // currentUser n'est pas encore chargé, permettre l'accès temporairement
    // L'intercepteur va charger currentUser et le router sera re-évalué
    console.log('roleGuard: currentUser not loaded yet, allowing access temporarily');
    return true;
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
