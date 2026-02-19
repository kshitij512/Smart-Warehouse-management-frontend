import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const store = inject(Store);

  const token = authService.getAccessToken();

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401 && !isRefreshing) {

        isRefreshing = true;

        return authService.refresh().pipe(
          switchMap(response => {

            const newToken = response.accessToken;

            authService.setAccessToken(newToken);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            isRefreshing = false;

            return next(retryReq);
          }),
          catchError(refreshError => {
            isRefreshing = false;

            store.dispatch(AuthActions.logout());

            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
