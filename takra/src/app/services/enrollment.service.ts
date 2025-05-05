
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = 'http://localhost:8080/api/enrollments';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    };
  }

  // Enroll a user to a training
  enrollUser(userId: number, trainingId: number): Observable<any> {
    return this.http.post(this.apiUrl, { userId, trainingId }, {
      headers: this.getHeaders()
    });
  }

  // Unenroll a user from a training
  unenrollUser(userId: number, trainingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?userId=${userId}&trainingId=${trainingId}`, {
      headers: this.getHeaders()
    });
  }

  // Check if user is enrolled in a training
  checkEnrollment(userId: number, trainingId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check?userId=${userId}&trainingId=${trainingId}`, {
      headers: this.getHeaders()
    });
  }
}
