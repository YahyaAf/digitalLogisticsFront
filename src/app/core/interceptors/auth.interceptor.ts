import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Routes qui ne nécessitent PAS de token
  const publicRoutes = ['/login', '/refresh', '/register'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
  
  // Ajouter le token sauf pour les routes publiques
  if (token && !isPublicRoute) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError(error => {
      // Ne pas intercepter les erreurs des routes publiques (login, refresh, register)
      if (isPublicRoute) {
        return throwError(() => error);
      }

      // Pour les autres routes, gérer le refresh token si 401
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = authService.getToken();
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(clonedReq);
          }),
          catchError(refreshError => {
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};
