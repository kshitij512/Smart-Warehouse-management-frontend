import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { OrderTrackingResponse } from "src/app/core/models/order-tracking.model";
import { OrderResponse, OrderStatus } from "src/app/core/models/order.model";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class OrderService {

  private readonly API =
    `${environment.apiBaseUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  create(payload: any) {
    return this.http.post<OrderResponse>(this.API, payload);
  }

  getByWarehouse(warehouseId: number) {
    return this.http.get<OrderResponse[]>(
      `${this.API}/warehouse/${warehouseId}`
    );
  }

  getByStatus(status: string) {
    return this.http.get<OrderResponse[]>(
      `${this.API}/status/${status}`
    );
  }

  assignStaff(orderId: number, staffId: number) {
    return this.http.put(
      `${this.API}/${orderId}/assign/${staffId}`,
      {}
    );
  }

  updateStatus(orderId: number, status: OrderStatus) {
  return this.http.put(
    `${this.API}/${orderId}/status`,
    { status }
  );
}


  getTracking(orderId: number) {
    return this.http.get<OrderTrackingResponse>(
      `${this.API}/${orderId}/tracking`
    );
  }
}
