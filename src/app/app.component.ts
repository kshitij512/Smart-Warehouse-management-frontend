import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectToken, selectUser, selectRole } from './store/auth/auth.selectors';
import * as AuthActions from './store/auth/auth.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  token$: Observable<string | null>;
  user$: Observable<string | null>;
  role$: Observable<string | null>;

  constructor(private store: Store) {
    this.token$ = this.store.select(selectToken);
    this.user$ = this.store.select(selectUser);
    this.role$ = this.store.select(selectRole);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
