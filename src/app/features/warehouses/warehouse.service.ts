import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { WarehouseResponse, CreateWarehouseRequest } from '../../core/models/warehouse.model';
import { UserResponse } from 'src/app/core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  private readonly API = `${environment.apiBaseUrl}/api/warehouses`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<WarehouseResponse[]> {
    return this.http.get<WarehouseResponse[]>(this.API);
  }

  create(request: CreateWarehouseRequest): Observable<WarehouseResponse> {
    return this.http.post<WarehouseResponse>(this.API, request);
  }

  getAllUsers(): Observable<UserResponse[]> {
  return this.http.get<UserResponse[]>(
    `${environment.apiBaseUrl}/api/admin/users`
  );
  }

  delete(id: number) {
    return this.http.delete(
      `${this.API}/${id}`
    );
  }

  update(id: number, payload: any) {
  return this.http.put(
    `${this.API}/${id}`,
    payload
  );
}


}
