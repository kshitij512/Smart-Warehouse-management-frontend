import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private API = `${environment.apiBaseUrl}/api/admin/users`;

  constructor(private http: HttpClient) {}

  getAllUsers() {
    return this.http.get<UserResponse[]>(this.API);
  }

  enableUser(id: number) {
    return this.http.put(`${this.API}/${id}/enable`, {});
  }

  disableUser(id: number) {
    return this.http.put(`${this.API}/${id}/disable`, {});
  }
}
