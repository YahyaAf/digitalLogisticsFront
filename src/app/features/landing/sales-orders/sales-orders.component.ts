import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { ProductService } from '../../../core/services/product.service';
import { 
  SalesOrderResponse, 
  SalesOrderLine, 
  OrderStatus 
} from '../../../core/models/sales-order.model';
import { ProductResponse } from '../../../core/models/product.model';

@Component({
  selector: 'app-sales-orders',
  standalone: false,
  templateUrl: './sales-orders.component.html',
  styleUrls: ['./sales-orders.component.css']
})
export class SalesOrdersComponent implements OnInit {
  orders = signal<SalesOrderResponse[]>([]);
  products = signal<ProductResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Form state
  showCreateModal = signal(false);
  orderLines = signal<SalesOrderLine[]>([]);
  selectedProduct = signal<number | null>(null);
  quantity = signal(1);
  unitPrice = signal(0);

  // View state
  selectedOrder = signal<SalesOrderResponse | null>(null);
  showDetailsModal = signal(false);

  OrderStatus = OrderStatus;

  constructor(
    private salesOrderService: SalesOrderService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier le token avec la même clé que AuthService
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      this.error.set('Vous devez être connecté pour accéder à cette page');
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadMyOrders();
    this.loadProducts();
  }

  loadMyOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.salesOrderService.getMySalesOrders().subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 403 || err.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.error.set('Session expirée. Veuillez vous reconnecter.');
          this.router.navigate(['/login']);
        } else {
          this.error.set(err.error?.message || 'Erreur lors du chargement des commandes');
        }
        this.loading.set(false);
      }
    });
  }

  loadProducts(): void {
    this.productService.getActiveProducts().subscribe({
      next: (response: any) => {
        this.products.set(response.data);
      },
      error: (err: any) => {
        console.error('Erreur chargement produits:', err);
        // Ne pas rediriger ici, juste logger l'erreur
        // Les produits ne sont pas critiques pour afficher la page
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.orderLines.set([]);
    this.error.set(null);
    this.successMessage.set(null);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.orderLines.set([]);
    this.selectedProduct.set(null);
    this.quantity.set(1);
    this.unitPrice.set(0);
  }

  onProductChange(productId: number): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      this.unitPrice.set(product.sellingPrice);
    }
  }

  addOrderLine(): void {
    const productId = this.selectedProduct();
    const qty = this.quantity();
    const price = this.unitPrice();

    if (!productId || qty < 1 || price <= 0) {
      this.error.set('Veuillez sélectionner un produit, une quantité et un prix valides');
      return;
    }

    // Check if product already exists in order lines
    const existingLine = this.orderLines().find(line => line.productId === productId);
    if (existingLine) {
      this.error.set('Ce produit est déjà dans la commande. Modifiez la quantité si nécessaire.');
      return;
    }

    const line: SalesOrderLine = {
      productId: productId,
      quantity: qty,
      unitPrice: price
    };

    this.orderLines.update(lines => [...lines, line]);
    
    // Reset form
    this.selectedProduct.set(null);
    this.quantity.set(1);
    this.unitPrice.set(0);
    this.error.set(null);
  }

  removeOrderLine(index: number): void {
    this.orderLines.update(lines => lines.filter((_, i) => i !== index));
  }

  getProductName(productId: number): string {
    const product = this.products().find(p => p.id === productId);
    return product ? product.name : 'Produit #' + productId;
  }

  submitOrder(): void {
    if (this.orderLines().length === 0) {
      this.error.set('Veuillez ajouter au moins un produit à votre commande');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request = {
      orderLines: this.orderLines()
    };

    this.salesOrderService.createSalesOrder(request).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.closeCreateModal();
        this.loadMyOrders();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la création de la commande');
        this.loading.set(false);
      }
    });
  }

  viewOrderDetails(order: SalesOrderResponse): void {
    this.selectedOrder.set(order);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }

  reserveStock(orderId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir réserver le stock pour cette commande ?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.salesOrderService.reserveStock(orderId).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadMyOrders();
        this.closeDetailsModal();
        
        setTimeout(() => this.successMessage.set(null), 8000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la réservation du stock');
        this.loading.set(false);
      }
    });
  }

  cancelOrder(orderId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.salesOrderService.cancelOrder(orderId).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadMyOrders();
        this.closeDetailsModal();
        
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de l\'annulation de la commande');
        this.loading.set(false);
      }
    });
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.CREATED:
        return 'bg-gray-100 text-gray-800';
      case OrderStatus.RESERVED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.BACKORDER:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.CREATED:
        return 'Créée';
      case OrderStatus.RESERVED:
        return 'Réservée';
      case OrderStatus.BACKORDER:
        return 'En attente';
      case OrderStatus.SHIPPED:
        return 'Expédiée';
      case OrderStatus.DELIVERED:
        return 'Livrée';
      case OrderStatus.CANCELED:
        return 'Annulée';
      default:
        return status;
    }
  }

  canReserve(order: SalesOrderResponse): boolean {
    return order.status === OrderStatus.CREATED;
  }

  canCancel(order: SalesOrderResponse): boolean {
    return order.status !== OrderStatus.SHIPPED && 
           order.status !== OrderStatus.DELIVERED &&
           order.status !== OrderStatus.CANCELED;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  }
}
