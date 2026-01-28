import { Component, OnInit, signal } from '@angular/core';
import { ShipmentService } from '../../../core/services/shipment.service';
import { 
  ShipmentResponse, 
  ShipmentStatus 
} from '../../../core/models/shipment.model';

@Component({
  selector: 'app-shipments',
  standalone: false,
  templateUrl: './shipments.component.html',
  styleUrls: ['./shipments.component.css']
})
export class ShipmentsComponent implements OnInit {
  shipments = signal<ShipmentResponse[]>([]);
  filteredShipments = signal<ShipmentResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  selectedShipment = signal<ShipmentResponse | null>(null);
  showDetailsModal = signal(false);
  showUpdateDateModal = signal(false);
  newPlannedDate = signal('');
  
  // Filters
  statusFilter = signal<ShipmentStatus | 'ALL'>('ALL');
  searchQuery = signal('');

  // Stats
  stats = signal({
    total: 0,
    planned: 0,
    inTransit: 0,
    delivered: 0
  });

  ShipmentStatus = ShipmentStatus;

  constructor(private shipmentService: ShipmentService) {}

  ngOnInit(): void {
    this.loadAllShipments();
    this.loadStats();
  }

  loadAllShipments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.shipmentService.getAllShipments().subscribe({
      next: (response) => {
        this.shipments.set(response.data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement des expéditions');
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.shipmentService.countShipments().subscribe({
      next: (response) => {
        this.stats.update(s => ({ ...s, total: response.data }));
      }
    });

    this.shipmentService.countShipmentsByStatus(ShipmentStatus.PLANNED).subscribe({
      next: (response) => {
        this.stats.update(s => ({ ...s, planned: response.data }));
      }
    });

    this.shipmentService.countShipmentsByStatus(ShipmentStatus.IN_TRANSIT).subscribe({
      next: (response) => {
        this.stats.update(s => ({ ...s, inTransit: response.data }));
      }
    });

    this.shipmentService.countShipmentsByStatus(ShipmentStatus.DELIVERED).subscribe({
      next: (response) => {
        this.stats.update(s => ({ ...s, delivered: response.data }));
      }
    });
  }

  applyFilters(): void {
    let filtered = this.shipments();

    // Filter by status
    if (this.statusFilter() !== 'ALL') {
      filtered = filtered.filter(shipment => shipment.status === this.statusFilter());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(shipment => 
        shipment.id.toString().includes(query) ||
        shipment.trackingNumber.toLowerCase().includes(query) ||
        shipment.clientName.toLowerCase().includes(query) ||
        shipment.clientEmail.toLowerCase().includes(query) ||
        (shipment.carrierName && shipment.carrierName.toLowerCase().includes(query))
      );
    }

    this.filteredShipments.set(filtered);
  }

  onStatusFilterChange(status: ShipmentStatus | 'ALL'): void {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  viewShipmentDetails(shipment: ShipmentResponse): void {
    this.selectedShipment.set(shipment);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedShipment.set(null);
  }

  openUpdateDateModal(shipment: ShipmentResponse): void {
    this.selectedShipment.set(shipment);
    this.newPlannedDate.set(shipment.plannedDate ? shipment.plannedDate.substring(0, 16) : '');
    this.showUpdateDateModal.set(true);
  }

  closeUpdateDateModal(): void {
    this.showUpdateDateModal.set(false);
    this.newPlannedDate.set('');
  }

  updatePlannedDate(): void {
    const shipment = this.selectedShipment();
    const plannedDate = this.newPlannedDate();
    
    if (!shipment || !plannedDate) {
      this.error.set('Veuillez sélectionner une date');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const isoDate = new Date(plannedDate).toISOString();

    this.shipmentService.updatePlannedDate(shipment.id, isoDate).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllShipments();
        this.loadStats();
        this.showUpdateDateModal.set(false);
        this.newPlannedDate.set('');
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la mise à jour de la date');
        this.loading.set(false);
      }
    });
  }

  markAsInTransit(shipmentId: number): void {
    if (!confirm('Marquer cette expédition comme en transit ?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.shipmentService.markAsInTransit(shipmentId).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllShipments();
        this.loadStats();
        this.closeDetailsModal();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du changement de statut');
        this.loading.set(false);
      }
    });
  }

  markAsDelivered(shipmentId: number): void {
    if (!confirm('Confirmer la livraison de cette expédition ?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.shipmentService.markAsDelivered(shipmentId).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllShipments();
        this.loadStats();
        this.closeDetailsModal();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la confirmation de livraison');
        this.loading.set(false);
      }
    });
  }

  deleteShipment(shipmentId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette expédition ? (Uniquement les expéditions PLANNED peuvent être supprimées)')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.shipmentService.deleteShipment(shipmentId).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllShipments();
        this.loadStats();
        this.closeDetailsModal();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la suppression');
        this.loading.set(false);
      }
    });
  }

  getStatusColor(status: ShipmentStatus): string {
    switch (status) {
      case ShipmentStatus.PLANNED:
        return 'bg-blue-100 text-blue-800';
      case ShipmentStatus.IN_TRANSIT:
        return 'bg-yellow-100 text-yellow-800';
      case ShipmentStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: ShipmentStatus): string {
    switch (status) {
      case ShipmentStatus.PLANNED:
        return 'Planifiée';
      case ShipmentStatus.IN_TRANSIT:
        return 'En transit';
      case ShipmentStatus.DELIVERED:
        return 'Livrée';
      default:
        return status;
    }
  }

  canMarkInTransit(shipment: ShipmentResponse): boolean {
    return shipment.status === ShipmentStatus.PLANNED;
  }

  canMarkDelivered(shipment: ShipmentResponse): boolean {
    return shipment.status === ShipmentStatus.IN_TRANSIT;
  }

  canDelete(shipment: ShipmentResponse): boolean {
    return shipment.status === ShipmentStatus.PLANNED;
  }

  canUpdateDate(shipment: ShipmentResponse): boolean {
    return shipment.status !== ShipmentStatus.DELIVERED;
  }

  formatDate(dateString?: string | null): string {
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
}
