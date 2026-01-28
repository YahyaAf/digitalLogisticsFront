import { Component, OnInit, signal } from '@angular/core';
import { CarrierService } from '../../../core/services/carrier.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { 
  CarrierResponse, 
  CarrierRequest,
  CarrierStatus 
} from '../../../core/models/carrier.model';
import { ShipmentResponse, ShipmentStatus } from '../../../core/models/shipment.model';

@Component({
  selector: 'app-carriers',
  standalone: false,
  templateUrl: './carriers.component.html',
  styleUrls: ['./carriers.component.css']
})
export class CarriersComponent implements OnInit {
  carriers = signal<CarrierResponse[]>([]);
  filteredCarriers = signal<CarrierResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  selectedCarrier = signal<CarrierResponse | null>(null);
  showDetailsModal = signal(false);
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showAssignShipmentsModal = signal(false);
  
  // Shipments for assignment
  availableShipments = signal<ShipmentResponse[]>([]);
  selectedShipmentIds = signal<number[]>([]);
  
  // Form
  carrierForm = signal<CarrierRequest>({
    code: '',
    name: '',
    contactEmail: '',
    contactPhone: '',
    baseShippingRate: 0,
    maxDailyCapacity: 10,
    cutOffTime: ''
  });
  
  // Filters
  statusFilter = signal<CarrierStatus | 'ALL'>('ALL');
  searchQuery = signal('');
  
  totalCount = signal(0);

  CarrierStatus = CarrierStatus;
  ShipmentStatus = ShipmentStatus;

  constructor(
    private carrierService: CarrierService,
    private shipmentService: ShipmentService
  ) {}

  ngOnInit(): void {
    this.loadAllCarriers();
    this.loadStats();
  }

  loadAllCarriers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.carrierService.getAllCarriers().subscribe({
      next: (response) => {
        this.carriers.set(response.data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement des transporteurs');
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.carrierService.countCarriers().subscribe({
      next: (response) => {
        this.totalCount.set(response.data);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.carriers();

    // Filter by status
    if (this.statusFilter() !== 'ALL') {
      filtered = filtered.filter(carrier => carrier.status === this.statusFilter());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(carrier => 
        carrier.id.toString().includes(query) ||
        carrier.code.toLowerCase().includes(query) ||
        carrier.name.toLowerCase().includes(query) ||
        carrier.contactEmail.toLowerCase().includes(query)
      );
    }

    this.filteredCarriers.set(filtered);
  }

  onStatusFilterChange(status: CarrierStatus | 'ALL'): void {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.applyFilters();
  }

  openCreateModal(): void {
    this.carrierForm.set({
      code: '',
      name: '',
      contactEmail: '',
      contactPhone: '',
      baseShippingRate: 0,
      maxDailyCapacity: 10,
      cutOffTime: ''
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  openEditModal(carrier: CarrierResponse): void {
    this.selectedCarrier.set(carrier);
    this.carrierForm.set({
      code: carrier.code,
      name: carrier.name,
      contactEmail: carrier.contactEmail,
      contactPhone: carrier.contactPhone,
      baseShippingRate: carrier.baseShippingRate,
      maxDailyCapacity: carrier.maxDailyCapacity,
      cutOffTime: carrier.cutOffTime || ''
    });
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedCarrier.set(null);
  }

  viewCarrierDetails(carrier: CarrierResponse): void {
    this.selectedCarrier.set(carrier);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedCarrier.set(null);
  }

  createCarrier(): void {
    const form = this.carrierForm();
    
    if (!form.code || !form.name) {
      this.error.set('Le code et le nom sont obligatoires');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.carrierService.createCarrier(form).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllCarriers();
        this.loadStats();
        this.closeCreateModal();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la création du transporteur');
        this.loading.set(false);
      }
    });
  }

  updateCarrier(): void {
    const carrier = this.selectedCarrier();
    const form = this.carrierForm();
    
    if (!carrier || !form.code || !form.name) {
      this.error.set('Le code et le nom sont obligatoires');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.carrierService.updateCarrier(carrier.id, form).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllCarriers();
        this.closeEditModal();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la modification du transporteur');
        this.loading.set(false);
      }
    });
  }

  updateCarrierStatus(carrierId: number, status: CarrierStatus): void {
    if (!confirm(`Changer le statut à ${status} ?`)) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.carrierService.updateCarrierStatus(carrierId, status).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllCarriers();
        this.closeDetailsModal();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du changement de statut');
        this.loading.set(false);
      }
    });
  }

  deleteCarrier(carrierId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce transporteur ? (Impossible si des expéditions sont assignées)')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.carrierService.deleteCarrier(carrierId).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllCarriers();
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

  resetDailyShipments(): void {
    if (!confirm('Réinitialiser les compteurs journaliers de tous les transporteurs ?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.carrierService.resetDailyShipments().subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.loading.set(false);
        this.loadAllCarriers();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la réinitialisation');
        this.loading.set(false);
      }
    });
  }

  getStatusColor(status: CarrierStatus): string {
    switch (status) {
      case CarrierStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case CarrierStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case CarrierStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: CarrierStatus): string {
    switch (status) {
      case CarrierStatus.ACTIVE:
        return 'Actif';
      case CarrierStatus.INACTIVE:
        return 'Inactif';
      case CarrierStatus.SUSPENDED:
        return 'Suspendu';
      default:
        return status;
    }
  }

  getCapacityColor(carrier: CarrierResponse): string {
    const percentage = (carrier.currentDailyShipments / carrier.maxDailyCapacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  }

  formatTime(time: string | null): string {
    if (!time) return '-';
    return time.substring(0, 5);
  }

  // Form update methods
  updateFormCode(value: string): void {
    this.carrierForm.update(f => ({ ...f, code: value }));
  }

  updateFormName(value: string): void {
    this.carrierForm.update(f => ({ ...f, name: value }));
  }

  updateFormEmail(value: string): void {
    this.carrierForm.update(f => ({ ...f, contactEmail: value }));
  }

  updateFormPhone(value: string): void {
    this.carrierForm.update(f => ({ ...f, contactPhone: value }));
  }

  updateFormRate(value: string): void {
    this.carrierForm.update(f => ({ ...f, baseShippingRate: +value }));
  }

  updateFormCapacity(value: string): void {
    this.carrierForm.update(f => ({ ...f, maxDailyCapacity: +value }));
  }

  // Assign Shipments
  openAssignShipmentsModal(carrier: CarrierResponse): void {
    this.selectedCarrier.set(carrier);
    this.selectedShipmentIds.set([]);
    this.loadAvailableShipments();
    this.showAssignShipmentsModal.set(true);
  }

  closeAssignShipmentsModal(): void {
    this.showAssignShipmentsModal.set(false);
    this.selectedCarrier.set(null);
    this.selectedShipmentIds.set([]);
    this.availableShipments.set([]);
  }

  loadAvailableShipments(): void {
    this.loading.set(true);
    this.shipmentService.getShipmentsByStatus(ShipmentStatus.PLANNED).subscribe({
      next: (response) => {
        this.availableShipments.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement des expéditions');
        this.loading.set(false);
      }
    });
  }

  toggleShipmentSelection(shipmentId: number): void {
    const currentIds = this.selectedShipmentIds();
    if (currentIds.includes(shipmentId)) {
      this.selectedShipmentIds.set(currentIds.filter(id => id !== shipmentId));
    } else {
      this.selectedShipmentIds.set([...currentIds, shipmentId]);
    }
  }

  isShipmentSelected(shipmentId: number): boolean {
    return this.selectedShipmentIds().includes(shipmentId);
  }

  isAllShipmentsSelected(): boolean {
    const availableCount = this.availableShipments().length;
    return availableCount > 0 && this.selectedShipmentIds().length === availableCount;
  }

  toggleSelectAll(): void {
    if (this.isAllShipmentsSelected()) {
      this.selectedShipmentIds.set([]);
    } else {
      this.selectedShipmentIds.set(this.availableShipments().map(s => s.id));
    }
  }

  assignSelectedShipments(): void {
    const carrier = this.selectedCarrier();
    const shipmentIds = this.selectedShipmentIds();
    
    if (!carrier || shipmentIds.length === 0) {
      this.error.set('Veuillez sélectionner au moins une expédition');
      return;
    }

    if (shipmentIds.length > carrier.availableCapacity) {
      this.error.set(`Capacité insuffisante. Disponible: ${carrier.availableCapacity}, Sélectionné: ${shipmentIds.length}`);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    if (shipmentIds.length === 1) {
      // Single assignment
      this.carrierService.assignShipment(carrier.id, shipmentIds[0]).subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          this.loading.set(false);
          this.loadAllCarriers();
          this.closeAssignShipmentsModal();
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de l\'assignation');
          this.loading.set(false);
        }
      });
    } else {
      // Multiple assignments
      this.carrierService.assignMultipleShipments(carrier.id, shipmentIds).subscribe({
        next: (response) => {
          this.successMessage.set(response.message);
          this.loading.set(false);
          this.loadAllCarriers();
          this.closeAssignShipmentsModal();
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erreur lors de l\'assignation');
          this.loading.set(false);
        }
      });
    }
  }

  getShipmentStatusColor(status: ShipmentStatus): string {
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

  getShipmentStatusLabel(status: ShipmentStatus): string {
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

  updateFormCutoff(value: string): void {
    this.carrierForm.update(f => ({ ...f, cutOffTime: value }));
  }
}
