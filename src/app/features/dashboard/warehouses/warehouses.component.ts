import { Component, OnInit, signal } from '@angular/core';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { UserService } from '../../../core/services/user.service';
import { WarehouseRequest, WarehouseResponse } from '../../../core/models/warehouse.model';
import { UserResponse, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-warehouses',
  standalone: false,
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.css']
})
export class WarehousesComponent implements OnInit {
  warehouses = signal<WarehouseResponse[]>([]);
  managers = signal<UserResponse[]>([]);
  loading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedWarehouseId = signal<number | null>(null);
  showManagerDropdown = signal<boolean>(false);
  
  warehouseForm = signal<WarehouseRequest>({
    name: '',
    code: '',
    capacity: 1000,
    active: true,
    managerId: 0
  });

  errorMessage = signal<string>('');
  validationErrors = signal<{[key: string]: string}>({});
  
  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  constructor(
    private warehouseService: WarehouseService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadManagers();
  }

  loadWarehouses(): void {
    this.loading.set(true);
    this.warehouseService.getAllWarehouses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.warehouses.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
        this.loading.set(false);
      }
    });
  }

  loadManagers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filter only users with WAREHOUSE_MANAGER role
          const warehouseManagers = response.data.filter(user => 
            user.role === Role.WAREHOUSE_MANAGER && user.active
          );
          this.managers.set(warehouseManagers);
        }
      },
      error: (error) => {
        console.error('Error loading managers:', error);
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedWarehouseId.set(null);
    this.warehouseForm.set({
      name: '',
      code: '',
      capacity: 1000,
      active: true,
      managerId: this.managers().length > 0 ? this.managers()[0].id : 0
    });
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  openEditModal(warehouse: WarehouseResponse): void {
    this.isEditMode.set(true);
    this.selectedWarehouseId.set(warehouse.id);
    
    this.warehouseService.getWarehouseById(warehouse.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.warehouseForm.set({
            name: response.data.name,
            code: response.data.code,
            capacity: response.data.capacity,
            active: response.data.active,
            managerId: response.data.managerId
          });
          this.errorMessage.set('');
          this.validationErrors.set({});
          this.showModal.set(true);
        }
      },
      error: (error) => {
        console.error('Error loading warehouse:', error);
        this.showNotification('error', 'Failed to load warehouse details');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.showManagerDropdown.set(false);
  }

  saveWarehouse(): void {
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.loading.set(true);

    const warehouseData = this.warehouseForm();

    if (this.isEditMode() && this.selectedWarehouseId()) {
      this.warehouseService.updateWarehouse(this.selectedWarehouseId()!, warehouseData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Warehouse updated successfully!');
            this.closeModal();
            this.loadWarehouses();
          }
        },
        error: (error) => {
          console.error('Error updating warehouse:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    } else {
      this.warehouseService.createWarehouse(warehouseData).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Warehouse created successfully!');
            this.closeModal();
            this.loadWarehouses();
          }
        },
        error: (error) => {
          console.error('Error creating warehouse:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    }
  }

  deleteWarehouse(id: number): void {
    if (!confirm('Are you sure you want to delete this warehouse?')) {
      return;
    }

    this.loading.set(true);
    this.warehouseService.deleteWarehouse(id).subscribe({
      next: (response) => {
        this.showNotification('success', 'Warehouse deleted successfully!');
        this.loadWarehouses();
      },
      error: (error) => {
        console.error('Error deleting warehouse:', error);
        this.loading.set(false);
        this.showNotification('error', error.error?.message || 'Failed to delete warehouse');
      }
    });
  }

  updateFormField(field: keyof WarehouseRequest, value: any): void {
    this.warehouseForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  selectManager(managerId: number): void {
    this.updateFormField('managerId', managerId);
    this.showManagerDropdown.set(false);
  }

  toggleManagerDropdown(): void {
    this.showManagerDropdown.update(show => !show);
  }

  getSelectedManager(): UserResponse | undefined {
    return this.managers().find(m => m.id === this.warehouseForm().managerId);
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
