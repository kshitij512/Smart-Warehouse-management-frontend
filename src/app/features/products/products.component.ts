import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';

import { ProductResponse } from 'src/app/core/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { debounceTime, switchMap, map, catchError, of } from 'rxjs';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {

  products: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];

  loading = false;
  error: string | null = null;
  toastMessage: string | null = null;

  editMode = false;
  editingId: number | null = null;

  searchTerm = '';
  currentPage = 1;
  pageSize = 5;

  sortField: keyof ProductResponse = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  showConfirmModal = false;
  deleteId: number | null = null;

  form = this.fb.group({
  sku: ['', {
    validators: [Validators.required],
    asyncValidators: [this.skuValidator()],
    updateOn: 'blur'
  }],
  name: ['', Validators.required],
  price: [0, [Validators.required, Validators.min(0.01)]]
});


  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  private skuValidator(): AsyncValidatorFn {

  return (control: AbstractControl) => {

    if (!control.value || this.editMode) {
      return of(null);
    }

    return of(control.value).pipe(
      debounceTime(400),
      switchMap(sku =>
        this.productService.checkSkuExists(sku)
      ),
      map(exists =>
        exists ? { skuTaken: true } : null
      ),
      catchError(() => of(null))
    );
  };
}


  loadProducts() {
    this.loading = true;
    this.error = null;

    this.productService.getAll().subscribe({
      next: data => {
        this.products = data;
        this.filteredProducts = [...data];
        this.currentPage = 1;
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Failed to load products';
        this.loading = false;
      }
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;

    if (this.editMode && this.editingId) {
      this.productService.update(this.editingId, this.form.value)
        .subscribe({
          next: () => {
            this.showToast('Product updated successfully');
            this.resetForm();
            this.loadProducts();
          },
          error: err => {
            this.error = err.error?.message || 'Update failed';
            this.loading = false;
          }
        });
    } else {
      this.productService.create(this.form.value)
        .subscribe({
          next: () => {
            this.showToast('Product created successfully');
            this.resetForm();
            this.loadProducts();
          },
          error: err => {
            this.error = err.error?.message || 'Creation failed';
            this.loading = false;
          }
        });
    }
  }

  editProduct(p: ProductResponse) {
    this.editMode = true;
    this.editingId = p.id;

    this.form.patchValue({
      sku: p.sku,
      name: p.name,
      price: p.price
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  confirmDelete(id: number) {
    this.deleteId = id;
    this.showConfirmModal = true;
  }

  cancelDelete() {
    this.showConfirmModal = false;
    this.deleteId = null;
  }

  deleteProduct() {
    if (!this.deleteId) return;

    this.productService.delete(this.deleteId)
      .subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== this.deleteId);
          this.filteredProducts = [...this.products];
          this.showToast('Product deleted successfully');
          this.cancelDelete();
        },
        error: () => {
          this.error = 'Delete failed';
          this.cancelDelete();
        }
      });
  }

  resetForm() {
    this.form.reset();
    this.editMode = false;
    this.editingId = null;
    this.loading = false;
  }

  applySearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  sort(field: keyof ProductResponse) {
    if (this.sortField === field) {
      this.sortDirection =
        this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredProducts.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
