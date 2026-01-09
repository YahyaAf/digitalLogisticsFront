import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { ProductRequest, ProductResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  createProduct(request: ProductRequest): Observable<ApiResponse<ProductResponse>> {
    // Always send JSON without image
    const jsonRequest = {
      sku: request.sku,
      name: request.name,
      category: request.category,
      originalPrice: request.originalPrice,
      profite: request.profite,
      active: request.active
    };
    return this.http.post<ApiResponse<ProductResponse>>(this.API_URL, jsonRequest);
  }

  uploadProductImage(productId: number, imageFile: File): Observable<ApiResponse<ProductResponse>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post<ApiResponse<ProductResponse>>(`${this.API_URL}/${productId}/image`, formData);
  }

  getAllProducts(): Observable<ApiResponse<ProductResponse[]>> {
    return this.http.get<ApiResponse<ProductResponse[]>>(this.API_URL);
  }

  getProductById(id: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.get<ApiResponse<ProductResponse>>(`${this.API_URL}/${id}`);
  }

  updateProduct(id: number, request: ProductRequest): Observable<ApiResponse<ProductResponse>> {
    // Always send JSON without image
    const jsonRequest = {
      sku: request.sku,
      name: request.name,
      category: request.category,
      originalPrice: request.originalPrice,
      profite: request.profite,
      active: request.active
    };
    return this.http.put<ApiResponse<ProductResponse>>(`${this.API_URL}/${id}`, jsonRequest);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }

  countProducts(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count`);
  }
}
