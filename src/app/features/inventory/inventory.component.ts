import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { InventoryService } from './inventory.service';
import { WarehouseService } from '../warehouses/warehouse.service';


import { InventoryResponse } from 'src/app/core/models/inventory.model';
import { WarehouseResponse } from 'src/app/core/models/warehouse.model';
import { ProductResponse } from 'src/app/core/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent {

  warehouses: WarehouseResponse[] = [];
  products: ProductResponse[] = [];
  inventory: InventoryResponse[] = [];

  selectedWarehouseId: number | null = null;

  showOnlyLowStock = false;

  loading = false;
  error: string | null = null;
  toastMessage: string | null = null;

  form = this.fb.group({
    productId: [null, Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    reorderThreshold: [10, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadWarehouses();
    this.loadProducts();
  }

  loadWarehouses() {
    this.warehouseService.getAll().subscribe({
      next: (data: WarehouseResponse[]) => {
        this.warehouses = data;

        if (data.length === 1) {
          this.selectedWarehouseId = data[0].id;
          this.loadInventory();
        }
      }
    });
  }

  get lowStockItems() {
  return this.inventory.filter(i => i.quantity <= i.reorderThreshold);
}

get criticalStockItems() {
  return this.inventory.filter(i =>
    i.quantity <= i.reorderThreshold * 0.5
  );
}

get displayedInventory() {
  if (this.showOnlyLowStock) {
    return this.lowStockItems;
  }
  return this.inventory;
}

getStockStatus(item: InventoryResponse): 'normal' | 'low' | 'critical' {
  if (item.quantity <= item.reorderThreshold * 0.5) return 'critical';
  if (item.quantity <= item.reorderThreshold) return 'low';
  return 'normal';
}

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (data: ProductResponse[]) => {
        this.products = data;
      }
    });
  }

  loadInventory() {
    if (!this.selectedWarehouseId) return;

    this.loading = true;

    this.inventoryService
      .getByWarehouse(this.selectedWarehouseId)
      .subscribe({
        next: (data: InventoryResponse[]) => {
          this.inventory = data;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Failed to load inventory';
          this.loading = false;
        }
      });
  }

  addProductToWarehouse() {
    if (this.form.invalid || !this.selectedWarehouseId) return;

    const payload = {
      warehouseId: this.selectedWarehouseId,
      productId: this.form.value.productId,
      quantity: this.form.value.quantity,
      reorderThreshold: this.form.value.reorderThreshold
    };

    this.inventoryService.addProduct(payload)
      .subscribe({
        next: () => {
          this.showToast('Product added to warehouse');
          this.form.reset();
          this.loadInventory();
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Add failed';
        }
      });
  }

  updateStock(productId: number, qty: number) {
    if (!this.selectedWarehouseId) return;

    this.inventoryService
      .updateStock(this.selectedWarehouseId, productId, qty)
      .subscribe({
        next: () => {
          this.loadInventory();
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Update failed';
        }
      });
  }

  isLowStock(item: InventoryResponse): boolean {
    return item.quantity <= item.reorderThreshold;
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
