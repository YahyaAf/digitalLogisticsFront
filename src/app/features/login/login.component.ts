import { Component, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  successMessage = signal('');
  validationErrors = signal<{[key: string]: string}>({});
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Check if coming from registration with success message
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { message?: string };
    if (state?.message) {
      this.successMessage.set(state.message);
    }
  }

  onLogin(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.validationErrors.set({});

    const credentials: LoginRequest = {
      email: this.email(),
      password: this.password()
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login Success:', response);
        if (response.success) {
          // Charger les infos de l'utilisateur après login réussi
          this.authService.getCurrentUser().subscribe({
            next: () => {
              this.router.navigate(['/dashboard']);
            },
            error: () => {
              // Même si getCurrentUser échoue, on redirige quand même
              this.router.navigate(['/dashboard']);
            }
          });
        }
      },
      error: (error) => {
        console.error('❌ Login Error:', error);
        console.error('❌ Error Details:', {
          status: error.status,
          statusText: error.statusText,
          errorBody: error.error
        });
        
        // Si le backend renvoie une structure avec data.errors (validation)
        if (error.error?.data?.errors && typeof error.error.data.errors === 'object') {
          const errors: {[key: string]: string} = {};
          Object.keys(error.error.data.errors).forEach((field) => {
            errors[field] = error.error.data.errors[field];
          });
          this.validationErrors.set(errors);
          this.errorMessage.set(error.error.message || 'Veuillez corriger les erreurs ci-dessous');
        }
        // Si le backend renvoie un array d'erreurs
        else if (error.error?.errors && Array.isArray(error.error.errors)) {
          const errors: {[key: string]: string} = {};
          error.error.errors.forEach((err: any) => {
            errors[err.field] = err.message;
          });
          this.validationErrors.set(errors);
          this.errorMessage.set('Veuillez corriger les erreurs ci-dessous');
        }
        // Si le backend renvoie juste un message
        else if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        }
        // Cas 401 (Unauthorized) - credentials incorrects
        else if (error.status === 401) {
          this.errorMessage.set('Email ou mot de passe incorrect');
        }
        // Erreur réseau
        else if (error.status === 0) {
          this.errorMessage.set('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
        // Autre erreur
        else {
          this.errorMessage.set(`Erreur ${error.status}: ${error.statusText || 'Erreur de connexion'}`);
        }
        
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
