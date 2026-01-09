import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { WarehouseRequest, WarehouseResponse } from '../models/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private readonly API_URL = 'http://localhost:8080/api/warehouses';

  constructor(private http: HttpClient) {}

  createWarehouse(warehouse: WarehouseRequest): Observable<ApiResponse<WarehouseResponse>> {
    return this.http.post<ApiResponse<WarehouseResponse>>(this.API_URL, warehouse);
  }

  getAllWarehouses(): Observable<ApiResponse<WarehouseResponse[]>> {
    return this.http.get<ApiResponse<WarehouseResponse[]>>(this.API_URL);
  }

  getWarehouseById(id: number): Observable<ApiResponse<WarehouseResponse>> {
    return this.http.get<ApiResponse<WarehouseResponse>>(`${this.API_URL}/${id}`);
  }

  updateWarehouse(id: number, warehouse: WarehouseRequest): Observable<ApiResponse<WarehouseResponse>> {
    return this.http.put<ApiResponse<WarehouseResponse>>(`${this.API_URL}/${id}`, warehouse);
  }

  deleteWarehouse(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  countWarehouses(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count`);
  }
}
