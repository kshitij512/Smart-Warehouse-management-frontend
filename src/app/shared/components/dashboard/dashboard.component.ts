import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { RouterModule } from '@angular/router';
import { selectUser, selectRole } from '../../../store/auth/auth.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  user$: Observable<string | null>;
  role$: Observable<string | null>;

  constructor(private store: Store) {
    this.user$ = this.store.select(selectUser);
    this.role$ = this.store.select(selectRole);
  }
}
