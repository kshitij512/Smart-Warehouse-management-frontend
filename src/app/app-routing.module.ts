import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
    path: '**',
    redirectTo: 'login'
  },
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./shared/components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
}
];
