import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { UserRequest, UserResponse, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users = signal<UserResponse[]>([]);
  loading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedUserId = signal<number | null>(null);
  showRoleDropdown = signal<boolean>(false);
  
  userForm = signal<UserRequest>({
    name: '',
    email: '',
    password: '',
    role: Role.CLIENT,
    active: true
  });

  errorMessage = signal<string>('');
  validationErrors = signal<{[key: string]: string}>({});
  
  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Available roles for dropdown
  availableRoles = [
    { value: Role.ADMIN, label: 'Admin', color: 'text-red-400', icon: '👑' },
    { value: Role.WAREHOUSE_MANAGER, label: 'Warehouse Manager', color: 'text-blue-400', icon: '📦' },
    { value: Role.CLIENT, label: 'Client', color: 'text-purple-400', icon: '🛒' }
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedUserId.set(null);
    this.userForm.set({
      name: '',
      email: '',
      password: '',
      role: Role.CLIENT,
      active: true
    });
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  openEditModal(user: UserResponse): void {
    this.isEditMode.set(true);
    this.selectedUserId.set(user.id);
    
    // Load full user data
    this.userService.getUserById(user.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userForm.set({
            name: response.data.name,
            email: response.data.email,
            password: '', // Don't populate password for security
            role: response.data.role,
            active: response.data.active
          });
          this.errorMessage.set('');
          this.validationErrors.set({});
          this.showModal.set(true);
        }
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.showNotification('error', 'Failed to load user details');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showRoleDropdown.set(false);
  }

  saveUser(): void {
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.loading.set(true);

    const userData = this.userForm();

    if (this.isEditMode() && this.selectedUserId()) {
      // Update existing user
      this.userService.updateUser(this.selectedUserId()!, userData).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          if (response.success) {
            this.showNotification('success', 'User updated successfully!');
            this.closeModal();
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    } else {
      // Create new user
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          console.log('Create response:', response);
          if (response.success) {
            this.showNotification('success', 'User created successfully!');
            this.closeModal();
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.loading.set(true);
    this.userService.deleteUser(id).subscribe({
      next: (response) => {
        console.log('Delete response:', response);
        this.showNotification('success', 'User deleted successfully!');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.loading.set(false);
        this.showNotification('error', error.error?.message || 'Failed to delete user');
      }
    });
  }

  updateFormField(field: keyof UserRequest, value: any): void {
    this.userForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  selectRole(role: Role): void {
    this.updateFormField('role', role);
    this.showRoleDropdown.set(false);
  }

  toggleRoleDropdown(): void {
    this.showRoleDropdown.update(show => !show);
  }

  getRoleDisplay(role: Role): any {
    return this.availableRoles.find(r => r.value === role) || this.availableRoles[2];
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message });
    setTimeout(() => {
      this.notification.set(null);
    }, 3000);
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
}
