import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectToken } from './store/auth/auth.selectors';
import * as AuthActions from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html'
})
export class AppComponent {

  token$ = this.store.select(selectToken);

  constructor(private store: Store) {}

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
