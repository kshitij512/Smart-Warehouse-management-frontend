import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {

  users: UserResponse[] = [];
  loading = false;
  error: string | null = null;
  toastMessage: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (data: UserResponse[]) => {
        this.users = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load users';
        this.loading = false;
      }
    });
  }

  enableUser(id: number) {
    this.userService.enableUser(id).subscribe({
      next: () => {
        this.showToast('User enabled');
        this.loadUsers();
      },
      error: () => this.error = 'Enable failed'
    });
  }

  disableUser(id: number) {
    this.userService.disableUser(id).subscribe({
      next: () => {
        this.showToast('User disabled');
        this.loadUsers();
      },
      error: () => this.error = 'Disable failed'
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = null, 3000);
  }
}
