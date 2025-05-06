import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  // role is omitted here because it is set by the service
}

interface RegisterResponse {
  token: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  // Adjust the URL if needed; sometimes the extra '/register' might not be necessary
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, ) {}

  register(user: RegisterRequest): Observable<RegisterResponse> {
    const body = { ...user, role: 'USER' };
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, body);
  }
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/authenticate`, credentials);
  }
  // Logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, null, {
      responseType: 'text'
    });
  }
 

   requestReset(email: string, appUrl: string): Observable<any> {
     const params = new HttpParams()
       .set('email', email)
       .set('appUrl', appUrl);
 
     return this.http.post(`${this.apiUrl}/reset-password-request`, null, { params });
   }
 
   // Reset password by token
   resetPassword(token: string, newPassword: string): Observable<any> {
     const params = new HttpParams()
       .set('token', token)
       .set('newPassword', newPassword);
 
     return this.http.post(`${this.apiUrl}/reset-password`, null, { params });
   }
   //get user id from local storage
    getUserId(): number | null {
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        return parsedUser.iduser;
      }
      return null;
    }
  //get user from local storage
  getUser(): any {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }
}
