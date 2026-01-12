import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { PurchaseOrderRequest, PurchaseOrderResponse, PurchaseOrderStatus } from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private readonly API_URL = 'http://localhost:8080/api/purchase-orders';

  constructor(private http: HttpClient) {}

  createPurchaseOrder(request: PurchaseOrderRequest): Observable<ApiResponse<PurchaseOrderResponse>> {
    return this.http.post<ApiResponse<PurchaseOrderResponse>>(this.API_URL, request);
  }

  getAllPurchaseOrders(): Observable<ApiResponse<PurchaseOrderResponse[]>> {
    return this.http.get<ApiResponse<PurchaseOrderResponse[]>>(this.API_URL);
  }

  getPurchaseOrderById(id: number): Observable<ApiResponse<PurchaseOrderResponse>> {
    return this.http.get<ApiResponse<PurchaseOrderResponse>>(`${this.API_URL}/${id}`);
  }

  getPurchaseOrdersByStatus(status: PurchaseOrderStatus): Observable<ApiResponse<PurchaseOrderResponse[]>> {
    return this.http.get<ApiResponse<PurchaseOrderResponse[]>>(`${this.API_URL}/status/${status}`);
  }

  getPurchaseOrdersBySupplier(supplierId: number): Observable<ApiResponse<PurchaseOrderResponse[]>> {
    return this.http.get<ApiResponse<PurchaseOrderResponse[]>>(`${this.API_URL}/supplier/${supplierId}`);
  }

  updatePurchaseOrder(id: number, request: PurchaseOrderRequest): Observable<ApiResponse<PurchaseOrderResponse>> {
    return this.http.put<ApiResponse<PurchaseOrderResponse>>(`${this.API_URL}/${id}`, request);
  }

  approvePurchaseOrder(id: number): Observable<ApiResponse<PurchaseOrderResponse>> {
    return this.http.patch<ApiResponse<PurchaseOrderResponse>>(`${this.API_URL}/${id}/approve`, {});
  }

  receivePurchaseOrder(id: number, warehouseId: number): Observable<ApiResponse<PurchaseOrderResponse>> {
    return this.http.patch<ApiResponse<PurchaseOrderResponse>>(`${this.API_URL}/${id}/receive?warehouseId=${warehouseId}`, {});
  }

  cancelPurchaseOrder(id: number): Observable<ApiResponse<PurchaseOrderResponse>> {
    return this.http.patch<ApiResponse<PurchaseOrderResponse>>(`${this.API_URL}/${id}/cancel`, {});
  }

  deletePurchaseOrder(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  countPurchaseOrders(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count`);
  }

  countPurchaseOrdersByStatus(status: PurchaseOrderStatus): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count/status/${status}`);
  }
}
