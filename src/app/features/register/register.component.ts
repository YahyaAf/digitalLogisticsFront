import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = signal<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: ''
  });

  errorMessage = signal<string>('');
  validationErrors = signal<{[key: string]: string}>({});
  isLoading = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  updateFormField(field: keyof RegisterRequest, value: string): void {
    this.registerForm.update(form => ({
      ...form,
      [field]: value
    }));
    // Clear validation error for this field
    if (this.validationErrors()[field]) {
      const errors = {...this.validationErrors()};
      delete errors[field];
      this.validationErrors.set(errors);
    }
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.isLoading.set(true);

    this.authService.register(this.registerForm()).subscribe({
      next: (response) => {
        console.log('Registration response:', response);
        if (response.success) {
          // Redirect to login with success message
          this.router.navigate(['/login'], {
            state: { message: response.message || 'Inscription réussie. Veuillez vous connecter.' }
          });
        }
      },
      error: (error) => {
        console.error('Error registering:', error);
        this.isLoading.set(false);
        this.handleError(error);
      }
    });
  }

  handleError(error: any): void {
    console.log('Full error object:', error);
    console.log('Error.error.data:', error.error?.data);
    
    if (error.error?.data && typeof error.error.data === 'object') {
      const data = error.error.data;
      const errors: {[key: string]: string} = {};
      
      Object.keys(data).forEach((field) => {
        if (typeof data[field] === 'string') {
          errors[field] = data[field];
        }
      });
      
      if (Object.keys(errors).length > 0) {
        this.validationErrors.set(errors);
        this.errorMessage.set(error.error.message || 'Validation failed');
      } else {
        this.errorMessage.set(error.error?.message || 'An error occurred. Please try again.');
      }
    } else if (error.error?.message) {
      this.errorMessage.set(error.error.message);
    } else {
      this.errorMessage.set('An error occurred. Please try again.');
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
