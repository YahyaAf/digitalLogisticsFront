import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { 
  LoginRequest, 
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
      error: () => {
        this.clearTokens();
        this.isAuthenticated.set(false);
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
}
