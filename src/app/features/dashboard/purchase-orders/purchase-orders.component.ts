import { Component, OnInit, signal } from '@angular/core';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ProductService } from '../../../core/services/product.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { PurchaseOrderRequest, PurchaseOrderResponse, PurchaseOrderStatus, PurchaseOrderLine } from '../../../core/models/purchase-order.model';
import { SupplierResponse } from '../../../core/models/supplier.model';
import { ProductResponse } from '../../../core/models/product.model';
import { WarehouseResponse } from '../../../core/models/warehouse.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: false,
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.css']
})
export class PurchaseOrdersComponent implements OnInit {
  orders = signal<PurchaseOrderResponse[]>([]);
  suppliers = signal<SupplierResponse[]>([]);
  products = signal<ProductResponse[]>([]);
  warehouses = signal<WarehouseResponse[]>([]);
  loading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  showDetailsModal = signal<boolean>(false);
  showReceiveModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedOrderId = signal<number | null>(null);
  selectedOrder = signal<PurchaseOrderResponse | null>(null);
  selectedWarehouseId = signal<number>(0);
  
  filterStatus = signal<PurchaseOrderStatus | 'all'>('all');
  
  orderForm = signal<PurchaseOrderRequest>({
    supplierId: 0,
    expectedDelivery: '',
    orderLines: []
  });

  orderLines = signal<PurchaseOrderLine[]>([]);
  currentLine = signal<PurchaseOrderLine>({
    productId: 0,
    quantity: 1,
    unitPrice: 0
  });

  errorMessage = signal<string>('');
  validationErrors = signal<{[key: string]: string}>({});
  
  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  PurchaseOrderStatus = PurchaseOrderStatus;

  constructor(
    private orderService: PurchaseOrderService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadSuppliers();
    this.loadProducts();
    this.loadWarehouses();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getAllPurchaseOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading.set(false);
      }
    });
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.suppliers.set(response.data);
        }
      },
      error: (error) => console.error('Error loading suppliers:', error)
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data);
        }
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getAllWarehouses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.warehouses.set(response.data);
        }
      },
      error: (error) => console.error('Error loading warehouses:', error)
    });
  }

  filterByStatus(status: PurchaseOrderStatus | 'all'): void {
    this.filterStatus.set(status);
    if (status === 'all') {
      this.loadOrders();
    } else {
      this.loading.set(true);
      this.orderService.getPurchaseOrdersByStatus(status).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.orders.set(response.data);
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error filtering orders:', error);
          this.loading.set(false);
        }
      });
    }
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedOrderId.set(null);
    this.orderForm.set({
      supplierId: 0,
      expectedDelivery: '',
      orderLines: []
    });
    this.orderLines.set([]);
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  openEditModal(order: PurchaseOrderResponse): void {
    this.isEditMode.set(true);
    this.selectedOrderId.set(order.id);
    this.orderForm.set({
      supplierId: order.supplierId,
      expectedDelivery: order.expectedDelivery || '',
      orderLines: order.orderLines.map(line => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice
      }))
    });
    this.orderLines.set(order.orderLines.map(line => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice
    })));
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  openDetailsModal(order: PurchaseOrderResponse): void {
    this.selectedOrder.set(order);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }

  openReceiveModal(order: PurchaseOrderResponse): void {
    this.selectedOrder.set(order);
    this.selectedWarehouseId.set(0);
    this.showReceiveModal.set(true);
  }

  closeReceiveModal(): void {
    this.showReceiveModal.set(false);
    this.selectedOrder.set(null);
    this.selectedWarehouseId.set(0);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  updateFormField(field: keyof PurchaseOrderRequest, value: any): void {
    this.orderForm.set({
      ...this.orderForm(),
      [field]: value
    });
  }

  updateLineField(field: keyof PurchaseOrderLine, value: any): void {
    this.currentLine.set({
      ...this.currentLine(),
      [field]: value
    });
  }

  addLine(): void {
    const line = this.currentLine();
    const errors: {[key: string]: string} = {};

    // Validate order line
    if (!line.productId || line.productId === 0) {
      errors['lineProductId'] = 'Product is required';
    }
    if (!line.quantity || line.quantity < 1) {
      errors['lineQuantity'] = 'Quantity must be at least 1';
    }
    if (line.unitPrice === null || line.unitPrice === undefined || line.unitPrice < 0.01) {
      errors['lineUnitPrice'] = 'Unit price must be positive (at least 0.01)';
    }

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      this.errorMessage.set('Please fill in all order line fields correctly');
      setTimeout(() => {
        this.validationErrors.set({});
        this.errorMessage.set('');
      }, 3000);
      return;
    }

    this.orderLines.set([...this.orderLines(), { ...line }]);
    this.currentLine.set({ productId: 0, quantity: 1, unitPrice: 0 });
    this.validationErrors.set({});
    this.errorMessage.set('');
  }

  removeLine(index: number): void {
    const lines = this.orderLines();
    lines.splice(index, 1);
    this.orderLines.set([...lines]);
  }

  saveOrder(): void {
    this.errorMessage.set('');
    this.validationErrors.set({});

    // Client-side validation
    const errors: {[key: string]: string} = {};
    if (!this.orderForm().supplierId || this.orderForm().supplierId === 0) {
      errors['supplierId'] = 'Supplier is required';
    }
    if (this.orderLines().length === 0) {
      errors['orderLines'] = 'At least one order line is required';
    }

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.loading.set(true);

    // Prepare request and convert date to LocalDateTime format
    const formData = this.orderForm();
    const request: PurchaseOrderRequest = {
      supplierId: formData.supplierId,
      expectedDelivery: formData.expectedDelivery ? `${formData.expectedDelivery}T00:00:00` : '',
      orderLines: this.orderLines()
    };

    if (this.isEditMode() && this.selectedOrderId()) {
      this.orderService.updatePurchaseOrder(this.selectedOrderId()!, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Purchase order updated successfully!');
            this.closeModal();
            this.loadOrders();
          }
        },
        error: (error) => {
          console.error('Error updating order:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    } else {
      this.orderService.createPurchaseOrder(request).subscribe({
        next: (response) => {
          if (response.success) {
            this.showNotification('success', 'Purchase order created successfully!');
            this.closeModal();
            this.loadOrders();
          }
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    }
  }

  approveOrder(id: number): void {
    if (!confirm('Approve this purchase order?')) return;

    this.orderService.approvePurchaseOrder(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', 'Purchase order approved!');
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Error approving order:', error);
        this.showNotification('error', error.error?.message || 'Failed to approve order');
      }
    });
  }

  receiveOrder(): void {
    const order = this.selectedOrder();
    const warehouseId = this.selectedWarehouseId();
    
    if (!order || warehouseId === 0) return;

    this.orderService.receivePurchaseOrder(order.id, warehouseId).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', response.message || 'Purchase order received and inventory updated!');
          this.closeReceiveModal();
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Error receiving order:', error);
        this.showNotification('error', error.error?.message || 'Failed to receive order');
      }
    });
  }

  cancelOrder(id: number): void {
    if (!confirm('Cancel this purchase order?')) return;

    this.orderService.cancelPurchaseOrder(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', 'Purchase order canceled!');
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Error canceling order:', error);
        this.showNotification('error', error.error?.message || 'Failed to cancel order');
      }
    });
  }

  deleteOrder(id: number): void {
    if (!confirm('Delete this purchase order? This cannot be undone.')) return;

    this.orderService.deletePurchaseOrder(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNotification('success', 'Purchase order deleted!');
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Error deleting order:', error);
        this.showNotification('error', error.error?.message || 'Failed to delete order');
      }
    });
  }

  getStatusColor(status: PurchaseOrderStatus): string {
    switch (status) {
      case PurchaseOrderStatus.CREATED: return 'bg-yellow-500/20 text-yellow-400';
      case PurchaseOrderStatus.APPROVED: return 'bg-blue-500/20 text-blue-400';
      case PurchaseOrderStatus.RECEIVED: return 'bg-green-500/20 text-green-400';
      case PurchaseOrderStatus.CANCELED: return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  getProductName(productId: number): string {
    const product = this.products().find(p => p.id === productId);
    return product?.name || 'Unknown';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }

  handleError(error: any): void {
    console.log('Full error object:', error);
    console.log('error.error:', error.error);
    
    // Try to extract validation errors from different possible structures
    if (error.error?.data && typeof error.error.data === 'object') {
      const data = error.error.data;
      const errors: {[key: string]: string} = {};
      
      Object.keys(data).forEach((field) => {
        if (typeof data[field] === 'string') {
          // Transform technical field names to user-friendly messages
          let message = data[field];
          if (field === 'supplierId' && message.includes('positive')) {
            message = 'Supplier is required';
          }
          // Handle nested order line errors (e.g., orderLines[0].productId)
          if (field.startsWith('orderLines[')) {
            const match = field.match(/orderLines\[(\d+)\]\.(\w+)/);
            if (match) {
              const index = parseInt(match[1]);
              const lineField = match[2];
              field = `orderLine${index}_${lineField}`;
            }
          }
          errors[field] = message;
        }
      });
      
      if (Object.keys(errors).length > 0) {
        this.validationErrors.set(errors);
        this.errorMessage.set(error.error.message || 'Please correct the validation errors');
      } else {
        this.errorMessage.set(error.error.message || 'An error occurred');
      }
    } else if (error.error?.errors && typeof error.error.errors === 'object') {
      // Alternative error structure
      const errors: {[key: string]: string} = {};
      Object.keys(error.error.errors).forEach((field) => {
        errors[field] = error.error.errors[field];
      });
      this.validationErrors.set(errors);
      this.errorMessage.set(error.error.message || 'Please correct the validation errors');
    } else {
      this.errorMessage.set(error.error?.message || error.message || 'An error occurred');
    }
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message });
    setTimeout(() => {
      this.notification.set(null);
    }, 3000);
  }
}
