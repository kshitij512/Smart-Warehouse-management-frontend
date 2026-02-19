import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectRole } from '../../store/auth/auth.selectors';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route) => {
  const store = inject(Store);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'];

  return store.select(selectRole).pipe(
    take(1),
    map(role => {
      if (allowedRoles?.includes(role)) return true;

      router.navigate(['/dashboard']);
      return false;
    })
  );
};
