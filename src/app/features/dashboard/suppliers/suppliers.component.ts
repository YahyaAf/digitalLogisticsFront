import { Component, OnInit, signal } from '@angular/core';
import { SupplierService } from '../../../core/services/supplier.service';
import { SupplierResponse, SupplierRequest } from '../../../core/models/supplier.model';import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-suppliers',
  standalone: false,
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent implements OnInit {
  suppliers = signal<SupplierResponse[]>([]);
  loading = signal(false);
  showModal = signal(false);
  isEditMode = signal(false);
  selectedSupplierId = signal<number | null>(null);
  
  errorMessage = signal('');
  validationErrors = signal<{[key: string]: string}>({});
  
  notification = signal<{show: boolean, type: 'success' | 'error', message: string}>({
    show: false,
    type: 'success',
    message: ''
  });

  supplierForm = signal<SupplierRequest>({
    name: '',
    phoneNumber: '',
    address: '',
    matricule: ''
  });

  constructor(
    private supplierService: SupplierService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ show: true, type, message });
    setTimeout(() => {
      this.notification.set({ show: false, type: 'success', message: '' });
    }, 3000);
  }

  loadSuppliers(): void {
    this.loading.set(true);
    this.supplierService.getAllSuppliers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.suppliers.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.showNotification('error', 'Failed to load suppliers');
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedSupplierId.set(null);
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.supplierForm.set({
      name: '',
      phoneNumber: '',
      address: '',
      matricule: ''
    });
    this.showModal.set(true);
  }

  openEditModal(supplier: SupplierResponse): void {
    this.isEditMode.set(true);
    this.selectedSupplierId.set(supplier.id);
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.supplierForm.set({
      name: supplier.name,
      phoneNumber: supplier.phoneNumber,
      address: supplier.address,
      matricule: supplier.matricule
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveSupplier(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.validationErrors.set({});
    const form = this.supplierForm();

    if (this.isEditMode() && this.selectedSupplierId()) {
      this.supplierService.updateSupplier(this.selectedSupplierId()!, form).subscribe({
        next: (response) => {
          this.loadSuppliers();
          this.closeModal();
          this.showNotification('success', 'Supplier updated successfully!');
        },
        error: (error) => {
          console.error('Error updating supplier:', error);
          this.handleError(error);
          this.loading.set(false);
        }
      });
    } else {
      this.supplierService.createSupplier(form).subscribe({
        next: (response) => {
          this.loadSuppliers();
          this.closeModal();
          this.showNotification('success', 'Supplier created successfully!');
        },
        error: (error) => {
          console.error('Error creating supplier:', error);
          this.handleError(error);
          this.loading.set(false);
        }
      });
    }
  }

  deleteSupplier(id: number): void {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.loading.set(true);
      this.supplierService.deleteSupplier(id).subscribe({
        next: (response) => {
          console.log('Delete response:', response);
          this.showNotification('success', 'Supplier deleted successfully!');
          this.loadSuppliers();
        },
        error: (error) => {
          console.error('Error deleting supplier:', error);
          this.loading.set(false);
          this.showNotification('error', error.error?.message || 'Failed to delete supplier');
        }
      });
    }
  }

  updateFormField(field: keyof SupplierRequest, value: string): void {
    this.supplierForm.update(form => ({
      ...form,
      [field]: value
    }));
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
