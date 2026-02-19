import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { decodeJwt } from '../../core/services/jwt.util';
import { Router } from '@angular/router';


@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(action =>
        this.authService.login({
          email: action.email,
          password: action.password
        }).pipe(
                map(response => {
        const token = response.accessToken;

        this.authService.setAccessToken(token);

        const payload = decodeJwt(token);

        // navigate after success
        this.router.navigate(['/dashboard']);

        return AuthActions.loginSuccess({
            token,
            user: payload.sub,
            role: payload.role
        });
        }),

          catchError(err =>
            of(AuthActions.loginFailure({
              error: err.error?.message || 'Login failed'
            }))
          )
        )
      )
    )
  );

  logout$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.logout),
    switchMap(() =>
      this.authService.logout().pipe(
        map(() => {
          this.authService.clearToken();
          this.router.navigate(['/login']);
          return { type: '[Auth] Logout Success' };
        })
      )
    )
  )
);
}
