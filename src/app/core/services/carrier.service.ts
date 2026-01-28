import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  CarrierRequest, 
  CarrierResponse, 
  CarrierStatus,
  ApiResponse 
} from '../models/carrier.model';
import { ShipmentResponse } from '../models/shipment.model';

@Injectable({
  providedIn: 'root'
})
export class CarrierService {
  private apiUrl = 'http://localhost:8080/api/carriers';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createCarrier(request: CarrierRequest): Observable<ApiResponse<CarrierResponse>> {
    return this.http.post<ApiResponse<CarrierResponse>>(
      this.apiUrl,
      request,
      { headers: this.getHeaders() }
    );
  }

  getCarrierById(id: number): Observable<ApiResponse<CarrierResponse>> {
    return this.http.get<ApiResponse<CarrierResponse>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getCarrierByCode(code: string): Observable<ApiResponse<CarrierResponse>> {
    return this.http.get<ApiResponse<CarrierResponse>>(
      `${this.apiUrl}/code/${code}`,
      { headers: this.getHeaders() }
    );
  }

  getAllCarriers(): Observable<ApiResponse<CarrierResponse[]>> {
    return this.http.get<ApiResponse<CarrierResponse[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getCarriersByStatus(status: CarrierStatus): Observable<ApiResponse<CarrierResponse[]>> {
    return this.http.get<ApiResponse<CarrierResponse[]>>(
      `${this.apiUrl}/status/${status}`,
      { headers: this.getHeaders() }
    );
  }

  getAvailableCarriers(): Observable<ApiResponse<CarrierResponse[]>> {
    return this.http.get<ApiResponse<CarrierResponse[]>>(
      `${this.apiUrl}/available`,
      { headers: this.getHeaders() }
    );
  }

  updateCarrier(id: number, request: CarrierRequest): Observable<ApiResponse<CarrierResponse>> {
    return this.http.put<ApiResponse<CarrierResponse>>(
      `${this.apiUrl}/${id}`,
      request,
      { headers: this.getHeaders() }
    );
  }

  updateCarrierStatus(id: number, status: CarrierStatus): Observable<ApiResponse<CarrierResponse>> {
    return this.http.patch<ApiResponse<CarrierResponse>>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  assignShipment(carrierId: number, shipmentId: number): Observable<ApiResponse<ShipmentResponse>> {
    return this.http.patch<ApiResponse<ShipmentResponse>>(
      `${this.apiUrl}/${carrierId}/assign-shipment/${shipmentId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  assignMultipleShipments(carrierId: number, shipmentIds: number[]): Observable<ApiResponse<ShipmentResponse[]>> {
    return this.http.patch<ApiResponse<ShipmentResponse[]>>(
      `${this.apiUrl}/${carrierId}/assign-multiple`,
      shipmentIds,
      { headers: this.getHeaders() }
    );
  }

  getCarrierShipments(carrierId: number): Observable<ApiResponse<ShipmentResponse[]>> {
    return this.http.get<ApiResponse<ShipmentResponse[]>>(
      `${this.apiUrl}/${carrierId}/shipments`,
      { headers: this.getHeaders() }
    );
  }

  deleteCarrier(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  countCarriers(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/count`,
      { headers: this.getHeaders() }
    );
  }

  resetDailyShipments(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/reset-daily-shipments`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
