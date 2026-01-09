import { Component, OnInit, signal } from '@angular/core';
import { InventoryMovementService } from '../../../core/services/inventory-movement.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { InventoryMovementResponse } from '../../../core/models/inventory-movement.model';
import { WarehouseResponse } from '../../../core/models/warehouse.model';

@Component({
  selector: 'app-inventory-movements',
  standalone: false,
  templateUrl: './inventory-movements.component.html',
  styleUrls: ['./inventory-movements.component.css']
})
export class InventoryMovementsComponent implements OnInit {
  movements = signal<InventoryMovementResponse[]>([]);
  warehouses = signal<WarehouseResponse[]>([]);
  loading = signal<boolean>(false);
  
  filterType = signal<'all' | 'warehouse'>('all');
  selectedWarehouseId = signal<number | null>(null);
  
  constructor(
    private movementService: InventoryMovementService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    this.loadMovements();
    this.loadWarehouses();
  }

  loadMovements(): void {
    this.loading.set(true);
    this.movementService.getAllMovements().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('Movements data received:', response.data);
          console.log('First movement type:', response.data[0]?.type);
          this.movements.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading movements:', error);
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

  loadMovementsByWarehouse(warehouseId: number): void {
    this.loading.set(true);
    this.movementService.getMovementsByWarehouse(warehouseId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.movements.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading warehouse movements:', error);
        this.loading.set(false);
      }
    });
  }

  switchFilter(type: 'all' | 'warehouse'): void {
    this.filterType.set(type);
    if (type === 'all') {
      this.loadMovements();
    }
  }

  onWarehouseChange(warehouseId: number): void {
    this.selectedWarehouseId.set(warehouseId);
    if (warehouseId > 0) {
      this.loadMovementsByWarehouse(warehouseId);
    }
  }

  getMovementTypeColor(type: string): string {
    switch (type) {
      case 'INBOUND':
        return 'bg-green-500/20 text-green-400';
      case 'OUTBOUND':
        return 'bg-red-500/20 text-red-400';
      case 'ADJUSTMENT':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  }

  getMovementTypeIcon(type: string): string {
    switch (type) {
      case 'INBOUND':
        return '↓';
      case 'OUTBOUND':
        return '↑';
      case 'ADJUSTMENT':
        return '⚙';
      default:
        return '•';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalIn(): number {
    return this.movements()
      .filter(m => m.type === 'INBOUND')
      .reduce((sum, m) => sum + m.quantity, 0);
  }

  getTotalOut(): number {
    return this.movements()
      .filter(m => m.type === 'OUTBOUND')
      .reduce((sum, m) => sum + m.quantity, 0);
  }

  getTotalAdjustments(): number {
    return this.movements()
      .filter(m => m.type === 'ADJUSTMENT')
      .length;
  }
}
