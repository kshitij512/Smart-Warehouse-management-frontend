import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ProductResponse } from 'src/app/core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly API =
    `${environment.apiBaseUrl}/api/products`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.API);
  }

  create(payload: any) {
    return this.http.post<ProductResponse>(this.API, payload);
  }

  update(id: number, payload: any) {
    return this.http.put<ProductResponse>(
      `${this.API}/${id}`,
      payload
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }
}
