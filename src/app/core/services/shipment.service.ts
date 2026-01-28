import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ShipmentRequest, 
  ShipmentResponse, 
  ShipmentStatus,
  ApiResponse 
} from '../models/shipment.model';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private apiUrl = 'http://localhost:8080/api/shipments';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getShipmentById(id: number): Observable<ApiResponse<ShipmentResponse>> {
    return this.http.get<ApiResponse<ShipmentResponse>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getShipmentBySalesOrder(salesOrderId: number): Observable<ApiResponse<ShipmentResponse>> {
    return this.http.get<ApiResponse<ShipmentResponse>>(
      `${this.apiUrl}/sales-order/${salesOrderId}`,
      { headers: this.getHeaders() }
    );
  }

  trackShipment(trackingNumber: string): Observable<ApiResponse<ShipmentResponse>> {
    return this.http.get<ApiResponse<ShipmentResponse>>(
      `${this.apiUrl}/track/${trackingNumber}`,
      { headers: this.getHeaders() }
    );
  }

  getAllShipments(): Observable<ApiResponse<ShipmentResponse[]>> {
    return this.http.get<ApiResponse<ShipmentResponse[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getShipmentsByStatus(status: ShipmentStatus): Observable<ApiResponse<ShipmentResponse[]>> {
    return this.http.get<ApiResponse<ShipmentResponse[]>>(
      `${this.apiUrl}/status/${status}`,
      { headers: this.getHeaders() }
    );
  }

  markAsInTransit(id: number): Observable<ApiResponse<ShipmentResponse>> {
    return this.http.patch<ApiResponse<ShipmentResponse>>(
      `${this.apiUrl}/${id}/in-transit`,
      {},
      { headers: this.getHeaders() }
    );
  }

  markAsDelivered(id: number): Observable<ApiResponse<ShipmentResponse>> {
    return this.http.patch<ApiResponse<ShipmentResponse>>(
      `${this.apiUrl}/${id}/deliver`,
      {},
      { headers: this.getHeaders() }
    );
  }

  updatePlannedDate(id: number, plannedDate: string): Observable<ApiResponse<ShipmentResponse>> {
    return this.http.patch<ApiResponse<ShipmentResponse>>(
      `${this.apiUrl}/${id}/planned-date?plannedDate=${encodeURIComponent(plannedDate)}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deleteShipment(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  countShipments(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/count`,
      { headers: this.getHeaders() }
    );
  }

  countShipmentsByStatus(status: ShipmentStatus): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/count/status/${status}`,
      { headers: this.getHeaders() }
    );
  }
}
