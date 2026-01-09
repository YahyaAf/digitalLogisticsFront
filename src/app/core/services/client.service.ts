import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { ClientRequest, ClientResponse } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) {}

  createClient(client: ClientRequest): Observable<ApiResponse<ClientResponse>> {
    return this.http.post<ApiResponse<ClientResponse>>(this.API_URL, client);
  }

  getAllClients(): Observable<ApiResponse<ClientResponse[]>> {
    return this.http.get<ApiResponse<ClientResponse[]>>(this.API_URL);
  }

  getClientById(id: number): Observable<ApiResponse<ClientResponse>> {
    return this.http.get<ApiResponse<ClientResponse>>(`${this.API_URL}/${id}`);
  }

  updateClient(id: number, client: ClientRequest): Observable<ApiResponse<ClientResponse>> {
    return this.http.put<ApiResponse<ClientResponse>>(`${this.API_URL}/${id}`, client);
  }

  deleteClient(id: number): Observable<ApiResponse<ClientResponse>> {
    return this.http.delete<ApiResponse<ClientResponse>>(`${this.API_URL}/${id}`);
  }

  countClients(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count`);
  }
}
