import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { InventoryMovementResponse } from '../models/inventory-movement.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryMovementService {
  private readonly API_URL = 'http://localhost:8080/api/inventory-movements';

  constructor(private http: HttpClient) {}

  getAllMovements(): Observable<ApiResponse<InventoryMovementResponse[]>> {
    return this.http.get<ApiResponse<InventoryMovementResponse[]>>(this.API_URL);
  }

  getMovementsByInventory(inventoryId: number): Observable<ApiResponse<InventoryMovementResponse[]>> {
    return this.http.get<ApiResponse<InventoryMovementResponse[]>>(`${this.API_URL}/inventory/${inventoryId}`);
  }

  getMovementsByWarehouse(warehouseId: number): Observable<ApiResponse<InventoryMovementResponse[]>> {
    return this.http.get<ApiResponse<InventoryMovementResponse[]>>(`${this.API_URL}/warehouse/${warehouseId}`);
  }
}
