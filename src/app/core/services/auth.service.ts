import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { 
  LoginRequest,
  RegisterRequest, 
  RefreshTokenRequest, 
  AuthResponse, 
  ApiResponse, 
  User 
} from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth/jwt';
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveTokens(response.data);
            this.isAuthenticated.set(true);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/register`, userData);
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = this.getRefreshToken();
    const request: RefreshTokenRequest = { refreshToken: refreshToken || '' };
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/refresh`, request)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.saveTokens(response.data);
          }
        })
      );
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.API_URL}/logout`, {})
      .pipe(
        tap(() => {
          this.clearTokens();
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          this.router.navigate(['/login']);
        })
      );
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/me`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.currentUser.set(response.data);
            this.isAuthenticated.set(true);
          }
        })
      );
  }

  private loadCurrentUser(): void {
    this.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser.set(response.data);
        }
      },
      error: (error) => {
        // Ne pas déconnecter si c'est juste getCurrentUser qui échoue au refresh
        // L'interceptor va gérer le refresh du token si nécessaire
        console.warn('Failed to load current user:', error);
      }
    });
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      this.loadCurrentUser();
    }
  }

  private saveTokens(authResponse: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUserRole(): string | null {
    // Le JWT backend ne contient PAS le rôle, uniquement le subject (email)
    // On doit utiliser currentUser qui vient de l'API /me
    const user = this.currentUser();
    if (!user) {
      console.log('getUserRole: No currentUser yet');
      return null;
    }

    console.log('getUserRole: currentUser =', user);

    // Format 1: user.role (string direct)
    if (user.role) {
      const cleanRole = user.role.replace('ROLE_', '');
      console.log('getUserRole: Found in user.role =', cleanRole);
      return cleanRole;
    }

    // Format 2: user.roles (array de strings)
    if (user.roles && user.roles.length > 0) {
      const cleanRole = user.roles[0].replace('ROLE_', '');
      console.log('getUserRole: Found in user.roles =', cleanRole);
      return cleanRole;
    }

    // Format 3: user.authorities (Spring Security UserDetails)
    if (user.authorities && Array.isArray(user.authorities)) {
      console.log('getUserRole: authorities =', user.authorities);
      for (const auth of user.authorities) {
        const authStr = typeof auth === 'string' ? auth : auth.authority;
        if (authStr && (authStr.includes('ADMIN') || authStr.includes('MANAGER') || authStr.includes('CLIENT'))) {
          const cleanRole = authStr.replace('ROLE_', '');
          console.log('getUserRole: Found in authorities =', cleanRole);
          return cleanRole;
        }
      }
    }

    console.warn('getUserRole: No role found in user object. Keys:', Object.keys(user));
    return null;
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isManager(): boolean {
    return this.hasRole('WAREHOUSE_MANAGER');
  }

  isClient(): boolean {
    return this.hasRole('CLIENT');
  }
}
