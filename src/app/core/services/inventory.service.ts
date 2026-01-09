import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { InventoryRequest, InventoryResponse, InventorySummary } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly API_URL = 'http://localhost:8080/api/inventories';

  constructor(private http: HttpClient) {}

  createInventory(request: InventoryRequest): Observable<ApiResponse<InventoryResponse>> {
    return this.http.post<ApiResponse<InventoryResponse>>(this.API_URL, request);
  }

  getAllInventories(): Observable<ApiResponse<InventoryResponse[]>> {
    return this.http.get<ApiResponse<InventoryResponse[]>>(this.API_URL);
  }

  getInventoryById(id: number): Observable<ApiResponse<InventoryResponse>> {
    return this.http.get<ApiResponse<InventoryResponse>>(`${this.API_URL}/${id}`);
  }

  getInventoriesByWarehouse(warehouseId: number): Observable<ApiResponse<InventoryResponse[]>> {
    return this.http.get<ApiResponse<InventoryResponse[]>>(`${this.API_URL}/warehouse/${warehouseId}`);
  }

  getInventoriesByProduct(productId: number): Observable<ApiResponse<InventoryResponse[]>> {
    return this.http.get<ApiResponse<InventoryResponse[]>>(`${this.API_URL}/product/${productId}`);
  }

  getInventoryByWarehouseAndProduct(warehouseId: number, productId: number): Observable<ApiResponse<InventoryResponse>> {
    return this.http.get<ApiResponse<InventoryResponse>>(`${this.API_URL}/warehouse/${warehouseId}/product/${productId}`);
  }

  getLowStockInWarehouse(warehouseId: number, threshold: number = 10): Observable<ApiResponse<InventoryResponse[]>> {
    return this.http.get<ApiResponse<InventoryResponse[]>>(`${this.API_URL}/warehouse/${warehouseId}/low-stock?threshold=${threshold}`);
  }

  updateInventory(id: number, request: InventoryRequest): Observable<ApiResponse<InventoryResponse>> {
    return this.http.put<ApiResponse<InventoryResponse>>(`${this.API_URL}/${id}`, request);
  }

  adjustQuantities(id: number, qtyOnHand?: number, qtyReserved?: number): Observable<ApiResponse<InventoryResponse>> {
    let params = '';
    if (qtyOnHand !== undefined) params += `qtyOnHand=${qtyOnHand}&`;
    if (qtyReserved !== undefined) params += `qtyReserved=${qtyReserved}`;
    return this.http.patch<ApiResponse<InventoryResponse>>(`${this.API_URL}/${id}/adjust?${params}`, {});
  }

  deleteInventory(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  getTotalStockByProduct(productId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/product/${productId}/total-stock`);
  }

  getAvailableStockByProduct(productId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/product/${productId}/available-stock`);
  }

  countInventories(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count`);
  }
}
