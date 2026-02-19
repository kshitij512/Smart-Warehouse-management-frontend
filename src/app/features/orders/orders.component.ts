import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';

import { OrderService } from './order.service';
import { WarehouseService } from '../warehouses/warehouse.service';
import { OrderResponse, OrderStatus } from 'src/app/core/models/order.model';
import { WarehouseResponse } from 'src/app/core/models/warehouse.model';
import { ProductResponse } from 'src/app/core/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { UserResponse } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

import { Store } from '@ngrx/store';
import { selectRole } from 'src/app/store/auth/auth.selectors';
import { AuthState } from 'src/app/store/auth/auth.reducer';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {

  currentRole: string | null = null;

  selectedStaffId: number | null = null;
  staffUsers: UserResponse[] = [];

  warehouses: WarehouseResponse[] = [];
  products: ProductResponse[] = [];
  orders: OrderResponse[] = [];

  selectedWarehouseId: number | null = null;

  loading = false;
  error: string | null = null;
  toastMessage: string | null = null;

  trackingData: any = null;
  showTrackingModal = false;

  orderStatuses: OrderStatus[] = [
    'CREATED',
    'CONFIRMED',
    'PICKING',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ];

  form = this.fb.group({
    warehouseId: [null, Validators.required],
    customerName: ['', Validators.required],
    customerEmail: ['', Validators.required],
    customerAddress: ['', Validators.required],
    customerPhone: ['', Validators.required],
    items: this.fb.array([])
  });

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private userService: UserService,
    private store: Store<{ auth: AuthState }>
  ) {}

  ngOnInit() {
    this.store.select(selectRole)
      .subscribe((role: string | null) => {
        this.currentRole = role;
      });

    this.loadWarehouses();
    this.loadProducts();
    this.loadStaffUsers();
  }

  /* ================= ROLE HELPERS ================= */

  get isAdmin() {
    return this.currentRole === 'ADMIN';
  }

  get isManager() {
    return this.currentRole === 'WAREHOUSE_MANAGER';
  }

  get isStaff() {
    return this.currentRole === 'STAFF';
  }

  get canCreateOrder() {
    return this.isAdmin || this.isManager;
  }

  get canUpdateStatus() {
    return this.isAdmin || this.isManager;
  }

  get canAssignStaff() {
    return this.isAdmin || this.isManager;
  }

  /* ================= FORM ================= */

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem() {
    this.items.push(
      this.fb.group({
        productId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]]
      })
    );
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  /* ================= LOADERS ================= */

  loadWarehouses() {
    this.warehouseService.getAll().subscribe({
      next: (data: WarehouseResponse[]) => {
        this.warehouses = data;

        // Auto select warehouse for STAFF
        if (this.isStaff && data.length > 0) {
          this.selectedWarehouseId = data[0].id;
          this.loadOrders();
        }
      }
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (data: ProductResponse[]) => {
        this.products = data;
      }
    });
  }

  loadStaffUsers() {
    if (!this.canAssignStaff) return;

    this.userService.getAllUsers().subscribe({
      next: (data: UserResponse[]) => {
        this.staffUsers = data.filter(u => u.role === 'STAFF');
      }
    });
  }

  loadOrders() {
    if (!this.selectedWarehouseId) return;

    this.orderService.getByWarehouse(this.selectedWarehouseId)
      .subscribe({
        next: (data: OrderResponse[]) => {
          this.orders = data;
        }
      });
  }

  /* ================= ACTIONS ================= */

  createOrder() {
    if (!this.canCreateOrder || this.form.invalid) return;

    this.loading = true;

    this.orderService.create(this.form.value)
      .subscribe({
        next: () => {
          this.showToast('Order created successfully');
          this.form.reset();
          this.items.clear();
          this.loading = false;
          this.loadOrders();
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Order creation failed';
          this.loading = false;
        }
      });
  }

  updateStatus(orderId: number, status: OrderStatus) {
    if (!this.canUpdateStatus) return;

    this.orderService.updateStatus(orderId, status)
      .subscribe({
        next: () => this.loadOrders(),
        error: (err: any) => {
          this.error = err.error?.message || 'Status update failed';
        }
      });
  }

  assignStaff(orderId: number) {
    if (!this.canAssignStaff || !this.selectedStaffId) return;

    this.orderService.assignStaff(orderId, this.selectedStaffId)
      .subscribe({
        next: () => {
          this.showToast('Staff assigned');
          this.selectedStaffId = null;
          this.loadOrders();
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Assignment failed';
        }
      });
  }

  viewTracking(orderId: number) {
    this.orderService.getTracking(orderId)
      .subscribe({
        next: (data: any) => {
          this.trackingData = data;
          this.showTrackingModal = true;
        }
      });
  }

  closeTracking() {
    this.showTrackingModal = false;
    this.trackingData = null;
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
