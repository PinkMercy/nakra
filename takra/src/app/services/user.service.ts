import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user'; // Import the User model

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8080/api/auth/admin/users'; // Update with your backend URL

  constructor(private http: HttpClient) {}


  private getToken(): string | null {
    return localStorage.getItem('token'); // Ensure that 'token' is the key used to store the token
  }


  private getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return {
      Authorization: token ? `Bearer ${token}` : ''
    };
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(id: number, userData: Partial<User>): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put(url, userData, {
      headers: this.getAuthHeaders()
    });
  }

  addUser(userData: User): Observable<any> {
    return this.http.post(this.apiUrl, userData, {
      headers: this.getAuthHeaders()
    });
  }
}
