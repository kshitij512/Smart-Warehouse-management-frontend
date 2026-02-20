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

import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectRole } from 'src/app/store/auth/auth.selectors';
import { AuthState } from 'src/app/store/auth/auth.reducer';

/* ================= UI EXTENDED MODEL ================= */

interface OrderUI extends OrderResponse {
  _selectedStaffId?: number | null;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {

  /* ================= ROLE ================= */

  currentRole: string | null = null;

  get isAdmin() { return this.currentRole === 'ADMIN'; }
  get isManager() { return this.currentRole === 'WAREHOUSE_MANAGER'; }
  get isStaff() { return this.currentRole === 'STAFF'; }

  get canCreateOrder() { return this.isAdmin || this.isManager; }
  get canUpdateStatus() { return this.isAdmin || this.isManager; }
  get canAssignStaff() { return this.isAdmin || this.isManager; }

  /* ================= STATE ================= */

  staffUsers: UserResponse[] = [];
  warehouses: WarehouseResponse[] = [];
  products: ProductResponse[] = [];
  orders: OrderUI[] = [];

  selectedWarehouseId: number | null = null;
  selectedStatus: OrderStatus | null = null;

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

  /* ================= FORM ================= */

  form = this.fb.group({
    warehouseId: [null, Validators.required],
    customerName: ['', Validators.required],
    customerEmail: ['', Validators.required],
    customerAddress: ['', Validators.required],
    customerPhone: ['', Validators.required],
    items: this.fb.array([])
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private userService: UserService,
    private store: Store<{ auth: AuthState }>,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /* ================= INIT ================= */

  ngOnInit() {

    this.store.select(selectRole)
      .subscribe(role => this.currentRole = role);

    this.route.queryParams.subscribe(params => {

      this.selectedWarehouseId = params['warehouse']
        ? +params['warehouse']
        : null;

      this.selectedStatus = params['status'] ?? null;

      this.loadOrders();
    });

    this.loadWarehouses();
    this.loadProducts();
    this.loadStaffUsers();
  }

  /* ================= FILTER SYNC ================= */

  updateFilters() {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        warehouse: this.selectedWarehouseId,
        status: this.selectedStatus
      },
      queryParamsHandling: 'merge'
    });
  }

  /* ================= FORM ACTIONS ================= */

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
    this.warehouseService.getAll().subscribe(data => {
      this.warehouses = data;

      if (this.isStaff && data.length > 0 && !this.selectedWarehouseId) {
        this.selectedWarehouseId = data[0].id;
        this.updateFilters();
      }
    });
  }

  loadProducts() {
    this.productService.getAll()
      .subscribe(data => this.products = data);
  }

  loadStaffUsers() {
    if (!this.canAssignStaff) return;

    this.userService.getAllUsers()
      .subscribe(data => {
        this.staffUsers = data.filter(u => u.role === 'STAFF');
      });
  }

  loadOrders() {

    if (!this.selectedWarehouseId) {
      this.orders = [];
      return;
    }

    this.orderService
      .getByWarehouse(this.selectedWarehouseId)
      .subscribe(data => {

        let filtered = data;

        if (this.selectedStatus) {
          filtered = data.filter(
            o => o.status === this.selectedStatus
          );
        }

        this.orders = filtered.map(order => ({
          ...order,
          _selectedStaffId: null
        }));
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
        error: err => {
          this.error = err.error?.message || 'Order creation failed';
          this.loading = false;
        }
      });
  }

  updateStatus(order: OrderUI, status: OrderStatus) {

    if (!this.canUpdateStatus) return;

    this.orderService.updateStatus(order.id, status)
      .subscribe({
        next: () => {
          order.status = status;
          this.showToast('Status updated');
          this.loadOrders();
        },
        error: err => {
          this.error = err.error?.message || 'Status update failed';
        }
      });
  }

  assignStaff(order: OrderUI) {

    if (!this.canAssignStaff || !order._selectedStaffId) return;

    this.orderService.assignStaff(order.id, order._selectedStaffId)
      .subscribe({
        next: () => {
          const selected = this.staffUsers.find(
            s => s.id === order._selectedStaffId
          );

          if (selected) {
            order.assignedStaffName = selected.name;
          }

          order._selectedStaffId = null;
          this.showToast('Staff assigned');
        },
        error: err => {
          this.error = err.error?.message || 'Assignment failed';
        }
      });
  }

  /* ================= TRACKING ================= */

  viewTracking(orderId: number) {
    this.orderService.getTracking(orderId)
      .subscribe(data => {
        this.trackingData = data;
        this.showTrackingModal = true;
      });
  }

  getTimestamp(step: OrderStatus): string | null {

    if (!this.trackingData) return null;

    switch (step) {
      case 'CREATED': return this.trackingData.createdAt ?? null;
      case 'CONFIRMED': return this.trackingData.confirmedAt ?? null;
      case 'PICKING': return this.trackingData.pickingAt ?? null;
      case 'PACKED': return this.trackingData.packedAt ?? null;
      case 'SHIPPED': return this.trackingData.shippedAt ?? null;
      case 'DELIVERED': return this.trackingData.deliveredAt ?? null;
      case 'CANCELLED': return this.trackingData.cancelledAt ?? null;
      default: return null;
    }
  }

  getStepClass(step: OrderStatus): string {

    if (!this.trackingData) return 'pending';

    const currentStatus = this.trackingData.currentStatus as OrderStatus;

    if (currentStatus === 'CANCELLED') {
      if (step === 'CANCELLED') return 'cancelled';
      if (this.getTimestamp(step)) return 'completed';
      return 'pending';
    }

    const statusOrder: OrderStatus[] = [
      'CREATED',
      'CONFIRMED',
      'PICKING',
      'PACKED',
      'SHIPPED',
      'DELIVERED'
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';

    return 'pending';
  }

  closeTracking() {
    this.showTrackingModal = false;
    this.trackingData = null;
  }

  /* ================= UTIL ================= */

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
