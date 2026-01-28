import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  SalesOrderRequest, 
  SalesOrderResponse, 
  OrderStatus,
  ApiResponse 
} from '../models/sales-order.model';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private apiUrl = 'http://localhost:8080/api/sales-orders';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createSalesOrder(request: SalesOrderRequest): Observable<ApiResponse<SalesOrderResponse>> {
    return this.http.post<ApiResponse<SalesOrderResponse>>(
      this.apiUrl, 
      request, 
      { headers: this.getHeaders() }
    );
  }

  getSalesOrderById(id: number): Observable<ApiResponse<SalesOrderResponse>> {
    return this.http.get<ApiResponse<SalesOrderResponse>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getAllSalesOrders(): Observable<ApiResponse<SalesOrderResponse[]>> {
    return this.http.get<ApiResponse<SalesOrderResponse[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  getMySalesOrders(): Observable<ApiResponse<SalesOrderResponse[]>> {
    return this.http.get<ApiResponse<SalesOrderResponse[]>>(
      `${this.apiUrl}/my-orders`,
      { headers: this.getHeaders() }
    );
  }

  getSalesOrdersByStatus(status: OrderStatus): Observable<ApiResponse<SalesOrderResponse[]>> {
    return this.http.get<ApiResponse<SalesOrderResponse[]>>(
      `${this.apiUrl}/status/${status}`,
      { headers: this.getHeaders() }
    );
  }

  getSalesOrdersByClient(clientId: number): Observable<ApiResponse<SalesOrderResponse[]>> {
    return this.http.get<ApiResponse<SalesOrderResponse[]>>(
      `${this.apiUrl}/client/${clientId}`,
      { headers: this.getHeaders() }
    );
  }

  reserveStock(id: number): Observable<ApiResponse<SalesOrderResponse>> {
    return this.http.patch<ApiResponse<SalesOrderResponse>>(
      `${this.apiUrl}/${id}/reserve`,
      {},
      { headers: this.getHeaders() }
    );
  }

  shipOrder(id: number): Observable<ApiResponse<SalesOrderResponse>> {
    return this.http.patch<ApiResponse<SalesOrderResponse>>(
      `${this.apiUrl}/${id}/ship`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deliverOrder(id: number): Observable<ApiResponse<SalesOrderResponse>> {
    return this.http.patch<ApiResponse<SalesOrderResponse>>(
      `${this.apiUrl}/${id}/deliver`,
      {},
      { headers: this.getHeaders() }
    );
  }

  cancelOrder(id: number): Observable<ApiResponse<SalesOrderResponse>> {
    return this.http.patch<ApiResponse<SalesOrderResponse>>(
      `${this.apiUrl}/${id}/cancel`,
      {},
      { headers: this.getHeaders() }
    );
  }

  countSalesOrders(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/count`,
      { headers: this.getHeaders() }
    );
  }
}
