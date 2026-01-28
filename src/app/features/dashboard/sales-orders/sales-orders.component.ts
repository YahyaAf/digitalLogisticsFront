import { Component, OnInit, signal } from '@angular/core';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { 
  SalesOrderResponse, 
  OrderStatus 
} from '../../../core/models/sales-order.model';

@Component({
  selector: 'app-dashboard-sales-orders',
  standalone: false,
  templateUrl: './sales-orders.component.html',
  styleUrls: ['./sales-orders.component.css']
})
export class DashboardSalesOrdersComponent implements OnInit {
  orders = signal<SalesOrderResponse[]>([]);
  filteredOrders = signal<SalesOrderResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  selectedOrder = signal<SalesOrderResponse | null>(null);
  showDetailsModal = signal(false);
  
  // Filters
  statusFilter = signal<OrderStatus | 'ALL'>('ALL');
  searchQuery = signal('');

  OrderStatus = OrderStatus;

  constructor(private salesOrderService: SalesOrderService) {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.salesOrderService.getAllSalesOrders().subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement des commandes');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.orders();

    // Filter by status
    if (this.statusFilter() !== 'ALL') {
      filtered = filtered.filter(order => order.status === this.statusFilter());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(query) ||
        order.clientName.toLowerCase().includes(query) ||
        order.clientEmail.toLowerCase().includes(query)
      );
    }

    this.filteredOrders.set(filtered);
  }

  onStatusFilterChange(status: OrderStatus | 'ALL'): void {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
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
        this.loadAllOrders();
        this.closeDetailsModal();
        setTimeout(() => this.successMessage.set(null), 8000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la réservation du stock');
        this.loading.set(false);
      }
    });
  }

  shipOrder(orderId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir expédier cette commande ?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.salesOrderService.shipOrder(orderId).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllOrders();
        this.closeDetailsModal();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de l\'expédition de la commande');
        this.loading.set(false);
      }
    });
  }

  deliverOrder(orderId: number): void {
    if (!confirm('Confirmer la livraison de cette commande ?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.salesOrderService.deliverOrder(orderId).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllOrders();
        this.closeDetailsModal();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la livraison de la commande');
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
        this.loadAllOrders();
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

  canShip(order: SalesOrderResponse): boolean {
    return order.status === OrderStatus.RESERVED;
  }

  canDeliver(order: SalesOrderResponse): boolean {
    return order.status === OrderStatus.SHIPPED;
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
      month: 'short',
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
