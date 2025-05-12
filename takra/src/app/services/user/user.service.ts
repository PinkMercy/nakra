import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user'; // Import the User model
import { AuthService } from '../auth.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/auth/admin/users'; // Update with your backend URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getUserById(id: number): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url, {
      headers: this.authService.getAuthHeaders()
    });
  }

  addUser(userData: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<User>(url, userData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteUser(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, {
      headers: this.authService.getAuthHeaders()
    });
  }
}