import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/users/users.component')
        .then(m => m.UsersComponent)
  },

  {
    path: 'warehouses',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    loadComponent: () =>
      import('./features/warehouses/warehouses.component')
        .then(m => m.WarehousesComponent)
  },

  {
    path: 'products',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
    loadComponent: () =>
      import('./features/products/products.component')
        .then(m => m.ProductsComponent)
  },

  {
    path: 'orders',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'STAFF'] },
    loadComponent: () =>
      import('./features/orders/orders.component')
        .then(m => m.OrdersComponent)
  },

  {
    path: 'inventory',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['WAREHOUSE_MANAGER'] },
    loadComponent: () =>
      import('./features/inventory/inventory.component')
        .then(m => m.InventoryComponent)
  },

  // ✅ ALWAYS LAST
  {
    path: '**',
    redirectTo: 'login'
  }
];