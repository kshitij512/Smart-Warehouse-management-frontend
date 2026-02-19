import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { WarehouseService } from './warehouse.service';
import { WarehouseResponse } from '../../core/models/warehouse.model';
import { UserResponse } from 'src/app/core/models/user.model';



@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.css']
})
export class WarehousesComponent implements OnInit {

searchTerm = '';
filteredWarehouses: WarehouseResponse[] = [];
currentPage = 1;
pageSize = 5;

editMode = false;
editingWarehouseId: number | null = null;

  selectedWarehouseId: number | null = null;
  showConfirmModal = false;
  toastMessage: string | null = null;


  managers: UserResponse[] = [];

  warehouses: WarehouseResponse[] = [];
  loading = false;
  error: string | null = null;


  sortField: keyof WarehouseResponse = 'name';
sortDirection: 'asc' | 'desc' = 'asc';

sort(field: keyof WarehouseResponse) {
  if (this.sortField === field) {
    this.sortDirection =
      this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortField = field;
    this.sortDirection = 'asc';
  }

  this.warehouses.sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];

    if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}


  constructor(
    private warehouseService: WarehouseService,
    private fb: FormBuilder
  ) {}

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    location: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    code: ['', Validators.required],
    managerId: [null, Validators.required]
  });

  ngOnInit(): void {
    this.loadWarehouses();
  }

loadWarehouses() {
  this.loading = true;
  this.error = null;

  this.warehouseService.getAll().subscribe({
    next: (data) => {
      this.warehouses = data;

      // Initialize filtered list for search/pagination
      this.filteredWarehouses = [...data];

      // Reset pagination
      this.currentPage = 1;

      this.loading = false;
    },
    error: (err) => {
      this.error = err.error?.message || 'Failed to load warehouses';
      this.loading = false;
    }
  });
}


  submit() {
  if (this.form.invalid) return;

  this.loading = true;

  if (this.editMode && this.editingWarehouseId) {

    this.warehouseService.update(
      this.editingWarehouseId,
      this.form.value
    ).subscribe({
      next: () => {
        this.toastMessage = "Warehouse updated successfully";

        this.resetForm();
        this.loadWarehouses();
      },
      error: (err) => {
        this.error = err.error?.message || "Update failed";
        this.loading = false;
      }
    });

  } else {

    this.warehouseService.create(this.form.value as any)
      .subscribe({
        next: () => {
          this.toastMessage = "Warehouse created successfully";

          this.resetForm();
          this.loadWarehouses();
        },
        error: (err) => {
          this.error = err.error?.message || "Creation failed";
          this.loading = false;
        }
      });
  }
}
resetForm() {
  this.form.reset();
  this.editMode = false;
  this.editingWarehouseId = null;
  this.loading = false;

  setTimeout(() => this.toastMessage = null, 3000);
}


  loadManagers() {
  this.warehouseService.getAllUsers().subscribe({
    next: (users) => {
      this.managers = users.filter(
        u => u.role === 'WAREHOUSE_MANAGER'
      );
    },
    error: () => {
      this.error = 'Failed to load users';
    }
  });
}

confirmDelete(id: number) {
  this.selectedWarehouseId = id;
  this.showConfirmModal = true;
}

cancelDelete() {
  this.selectedWarehouseId = null;
  this.showConfirmModal = false;
}

deleteWarehouse() {
  if (!this.selectedWarehouseId) return;

  this.warehouseService.delete(this.selectedWarehouseId)
    .subscribe({
      next: () => {
        this.warehouses = this.warehouses
          .filter(w => w.id !== this.selectedWarehouseId);

        this.toastMessage = "Warehouse deleted successfully";

        this.showConfirmModal = false;
        this.selectedWarehouseId = null;

        setTimeout(() => this.toastMessage = null, 3000);
      },
      error: () => {
        this.error = "Failed to delete warehouse";
        this.showConfirmModal = false;
      }
    });
}

applySearch() {
  if (!this.searchTerm) {
    this.filteredWarehouses = [...this.warehouses];
    return;
  }

  const term = this.searchTerm.toLowerCase();

  this.filteredWarehouses = this.warehouses.filter(w =>
    w.name.toLowerCase().includes(term) ||
    w.location.toLowerCase().includes(term) ||
    w.code.toLowerCase().includes(term)
  );

  this.currentPage = 1;
}

resetSearch() {
  this.searchTerm = '';
  this.filteredWarehouses = [...this.warehouses];
  this.currentPage = 1;
}

get paginatedWarehouses() {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredWarehouses.slice(start, start + this.pageSize);
}


editWarehouse(w: WarehouseResponse) {
  this.editMode = true;
  this.editingWarehouseId = w.id;

  this.form.patchValue({
    name: w.name,
    location: w.location,
    capacity: w.capacity,
    code: w.code,
    managerId: null // optional: leave manager unchanged unless needed
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}




}
