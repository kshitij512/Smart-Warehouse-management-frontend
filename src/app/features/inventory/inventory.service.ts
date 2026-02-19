import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { InventoryResponse } from 'src/app/core/models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {

  private readonly API =
    `${environment.apiBaseUrl}/api/inventory`;

  constructor(private http: HttpClient) {}

  getByWarehouse(warehouseId: number):
    Observable<InventoryResponse[]> {
    return this.http.get<InventoryResponse[]>(
      `${this.API}/warehouse/${warehouseId}`
    );
  }

  addProduct(payload: any) {
    return this.http.post(this.API, payload);
  }

  updateStock(
    warehouseId: number,
    productId: number,
    quantity: number
  ) {
    return this.http.patch(
      `${this.API}/warehouse/${warehouseId}/product/${productId}`,
      { quantity }
    );
  }
}
