import { Component, OnInit, signal } from '@angular/core';
import { InventoryService } from '../../../core/services/inventory.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ProductService } from '../../../core/services/product.service';
import { InventoryRequest, InventoryResponse } from '../../../core/models/inventory.model';
import { WarehouseResponse } from '../../../core/models/warehouse.model';
import { ProductResponse } from '../../../core/models/product.model';

@Component({
  selector: 'app-inventories',
  standalone: false,
  templateUrl: './inventories.component.html',
  styleUrls: ['./inventories.component.css']
})
export class InventoriesComponent implements OnInit {
  inventories = signal<InventoryResponse[]>([]);
  warehouses = signal<WarehouseResponse[]>([]);
  products = signal<ProductResponse[]>([]);
  loading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedInventoryId = signal<number | null>(null);
  
  activeTab = signal<'all' | 'warehouse' | 'product'>('all');
  selectedWarehouseId = signal<number | null>(null);
  selectedProductId = signal<number | null>(null);
  lowStockThreshold = signal<number>(10);
  
  inventoryForm = signal<InventoryRequest>({
    warehouseId: 0,
    productId: 0,
    qtyOnHand: 0,
    qtyReserved: 0
  });

  errorMessage = signal<string>('');
  validationErrors = signal<{[key: string]: string}>({});
  
  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  constructor(
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadInventories();
    this.loadWarehouses();
    this.loadProducts();
  }

  loadInventories(): void {
    this.loading.set(true);
    this.inventoryService.getAllInventories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.inventories.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading inventories:', error);
        this.loading.set(false);
      }
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getAllWarehouses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.warehouses.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
      }
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadInventoriesByWarehouse(warehouseId: number): void {
    this.loading.set(true);
    this.inventoryService.getInventoriesByWarehouse(warehouseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.inventories.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading warehouse inventories:', error);
        this.loading.set(false);
      }
    });
  }

  loadInventoriesByProduct(productId: number): void {
    this.loading.set(true);
    this.inventoryService.getInventoriesByProduct(productId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.inventories.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading product inventories:', error);
        this.loading.set(false);
      }
    });
  }

  switchTab(tab: 'all' | 'warehouse' | 'product'): void {
    this.activeTab.set(tab);
    if (tab === 'all') {
      this.loadInventories();
    }
  }

  onWarehouseChange(warehouseId: number): void {
    this.selectedWarehouseId.set(warehouseId);
    if (warehouseId > 0) {
      this.loadInventoriesByWarehouse(warehouseId);
    }
  }

  onProductChange(productId: number): void {
    this.selectedProductId.set(productId);
    if (productId > 0) {
      this.loadInventoriesByProduct(productId);
    }
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedInventoryId.set(null);
    this.inventoryForm.set({
      warehouseId: 0,
      productId: 0,
      qtyOnHand: 0,
      qtyReserved: 0
    });
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  openEditModal(inventory: InventoryResponse): void {
    this.isEditMode.set(true);
    this.selectedInventoryId.set(inventory.id);
    
    this.inventoryService.getInventoryById(inventory.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.inventoryForm.set({
            warehouseId: response.data.warehouseId,
            productId: response.data.productId,
            qtyOnHand: response.data.qtyOnHand,
            qtyReserved: response.data.qtyReserved
          });
          this.errorMessage.set('');
          this.validationErrors.set({});
          this.showModal.set(true);
        }
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
        this.showNotification('error', 'Failed to load inventory details');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  updateFormField(field: keyof InventoryRequest, value: any): void {
    this.inventoryForm.set({
      ...this.inventoryForm(),
      [field]: value
    });
  }

  saveInventory(): void {
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.loading.set(true);

    const request = this.inventoryForm();

    if (this.isEditMode() && this.selectedInventoryId()) {
      this.inventoryService.updateInventory(this.selectedInventoryId()!, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Inventory updated successfully!');
            this.closeModal();
            this.refreshCurrentView();
          }
        },
        error: (error) => {
          console.error('Error updating inventory:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    } else {
      this.inventoryService.createInventory(request).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Inventory created successfully!');
            this.closeModal();
            this.refreshCurrentView();
          }
        },
        error: (error) => {
          console.error('Error creating inventory:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    }
  }

  deleteInventory(id: number): void {
    if (!confirm('Are you sure you want to delete this inventory record?')) {
      return;
    }

    this.inventoryService.deleteInventory(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', 'Inventory deleted successfully!');
          this.refreshCurrentView();
        }
      },
      error: (error) => {
        console.error('Error deleting inventory:', error);
        this.showNotification('error', 'Failed to delete inventory');
      }
    });
  }

  refreshCurrentView(): void {
    const tab = this.activeTab();
    if (tab === 'all') {
      this.loadInventories();
    } else if (tab === 'warehouse' && this.selectedWarehouseId()) {
      this.loadInventoriesByWarehouse(this.selectedWarehouseId()!);
    } else if (tab === 'product' && this.selectedProductId()) {
      this.loadInventoriesByProduct(this.selectedProductId()!);
    }
  }

  getStockStatus(inventory: InventoryResponse): 'low' | 'medium' | 'high' {
    const available = inventory.qtyAvailable;
    if (available <= 10) return 'low';
    if (available <= 50) return 'medium';
    return 'high';
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
        this.errorMessage.set(error.error.message || 'An error occurred');
      }
    } else {
      this.errorMessage.set(error.error?.message || 'An error occurred');
    }
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message });
    setTimeout(() => {
      this.notification.set(null);
    }, 3000);
  }

  getWarehouseName(warehouseId: number): string {
    const warehouse = this.warehouses().find(w => w.id === warehouseId);
    return warehouse?.name || 'Unknown';
  }

  getProductName(productId: number): string {
    const product = this.products().find(p => p.id === productId);
    return product?.name || 'Unknown';
  }
}
