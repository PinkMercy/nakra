import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user'; // Import the User model



@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8080/admin/users'; // Update with your backend URL

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    const username = 'admin';
    const password = 'admin';
    const basicAuth = this.getBasicAuthHeader(username, password);

    return this.http.get<User[]>(this.apiUrl, {
      headers: {
        Authorization: basicAuth
      }
    });
  }

  private getBasicAuthHeader(username: string, password: string): string {
    const credentials = btoa(`${username}:${password}`);
    return `Basic ${credentials}`;
  }

  deleteUser(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const username = 'admin'; // Use actual credentials
    const password = 'admin';
    const basicAuth = this.getBasicAuthHeader(username, password);
  
    return this.http.delete(url, {
      headers: {
        Authorization: basicAuth
      }
    });
  }
  updateUser(id: number, userData: Partial<User>): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const username = 'admin'; // Replace with actual credentials if needed
    const password = 'admin';
    const basicAuth = this.getBasicAuthHeader(username, password);
    
    return this.http.put(url, userData, {
      headers: {
        Authorization: basicAuth
      }
    });
  }
  addUser(userData: User): Observable<any> {
    const url = this.apiUrl; // Assuming the API endpoint for adding users is the same as fetching users
    const username = 'admin'; // Replace with actual credentials if needed
    const password = 'admin';
    const basicAuth = this.getBasicAuthHeader(username, password);
    
    return this.http.post(url, userData, {
      headers: {
        Authorization: basicAuth
      }
    });
  }
  
}
