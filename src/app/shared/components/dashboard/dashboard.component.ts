import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { RouterModule } from '@angular/router';
import { selectUser, selectRole } from '../../../store/auth/auth.selectors';
import { Observable, forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { WarehouseResponse } from '../../../core/models/warehouse.model';
import { ProductResponse } from '../../../core/models/product.model';
import { OrderResponse } from '../../../core/models/order.model';
import { WarehouseService } from 'src/app/features/warehouses/warehouse.service';
import { OrderService } from 'src/app/features/orders/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user$: Observable<string | null>;
  role$: Observable<string | null>;

  totalWarehouses = 0;
  totalProducts = 0;
  totalOrders = 0;

  createdCount = 0;
  confirmedCount = 0;
  shippedCount = 0;
  deliveredCount = 0;
  cancelledCount = 0;

  totalRevenue = 0;

  loading = true;

  constructor(
    private store: Store,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private orderService: OrderService
  ) {
    this.user$ = this.store.select(selectUser);
    this.role$ = this.store.select(selectRole);
  }

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics() {

  forkJoin({
    warehouses: this.warehouseService.getAll(),
    products: this.productService.getAll(),

    created: this.orderService.getByStatus('CREATED'),
    confirmed: this.orderService.getByStatus('CONFIRMED'),
    shipped: this.orderService.getByStatus('SHIPPED'),
    delivered: this.orderService.getByStatus('DELIVERED'),
    cancelled: this.orderService.getByStatus('CANCELLED')

  }).subscribe({
    next: (data: any) => {

      this.totalWarehouses = data.warehouses.length;
      this.totalProducts = data.products.length;

      this.createdCount = data.created.length;
      this.confirmedCount = data.confirmed.length;
      this.shippedCount = data.shipped.length;
      this.deliveredCount = data.delivered.length;
      this.cancelledCount = data.cancelled.length;

      this.totalOrders =
        this.createdCount +
        this.confirmedCount +
        this.shippedCount +
        this.deliveredCount +
        this.cancelledCount;

      this.totalRevenue = 0;

      [
        ...data.created,
        ...data.confirmed,
        ...data.shipped,
        ...data.delivered
      ].forEach((order: any) => {
        this.totalRevenue += order.totalAmount;
      });

      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });
}


  computeOrderStats(orders: OrderResponse[]) {

    orders.forEach(order => {

      this.totalRevenue += order.totalAmount;

      switch (order.status) {
        case 'CREATED':
          this.createdCount++;
          break;
        case 'CONFIRMED':
          this.confirmedCount++;
          break;
        case 'SHIPPED':
          this.shippedCount++;
          break;
        case 'DELIVERED':
          this.deliveredCount++;
          break;
        case 'CANCELLED':
          this.cancelledCount++;
          break;
      }
    });
  }
}
