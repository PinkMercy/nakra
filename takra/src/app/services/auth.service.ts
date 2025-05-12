import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  iduser?: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage on service init
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(user: RegisterRequest): Observable<AuthResponse> {
    const body = { ...user };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body)
      .pipe(
        tap(response => {
          // Store user details and token in local storage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials)
      .pipe(
        tap(response => {
          // Store user details and token in local storage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  // Logout - now sends token to backend
  logout(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.clearLocalStorage();
      return new Observable(observer => {
        observer.next('Logged out successfully');
        observer.complete();
      });
    }

    const logoutRequest: LogoutRequest = {
      token: token
    };

    return this.http.post(`${this.apiUrl}/logout`, logoutRequest, {
      responseType: 'text'
    }).pipe(
      tap(() => {
        this.clearLocalStorage();
      })
    );
  }

  // Made public so it can be called from components
  clearLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  // Method to validate token
  validateToken(token: string): Observable<boolean> {
    const params = new HttpParams().set('token', token);
    return this.http.post<boolean>(`${this.apiUrl}/validate-token`, null, { params });
  }

  requestReset(email: string, appUrl: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('appUrl', appUrl);

    return this.http.post(`${this.apiUrl}/reset-password-request`, null, { 
      params,
      responseType: 'text'
    });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);

    return this.http.post(`${this.apiUrl}/reset-password`, null, { 
      params,
      responseType: 'text'
    });
  }

  getUserId(): number | null {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.iduser;
    }
    return null;
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}