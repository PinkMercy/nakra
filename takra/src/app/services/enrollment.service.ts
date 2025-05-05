
import { Injectable } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = 'http://localhost:8080/api/enrollments';

  constructor(private http: HttpClient) {}

  /**
   * Enroll a user to a training
   * @param userId the ID of the user
   * @param trainingId the ID of the training
   * @returns Observable of the created enrollment
   */
  enrollUser(userId: number, trainingId: number): Observable<any> {
    return this.http.post(this.apiUrl, {
      userId: userId,
      trainingId: trainingId
    });
  }

  /**
   * Unenroll a user from a training
   * @param userId the ID of the user
   * @param trainingId the ID of the training
   * @returns Observable of the response
   */
  unenrollUser(userId: number, trainingId: number): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('trainingId', trainingId.toString());
    
    return this.http.delete(this.apiUrl, { params });
  }

  /**
   * Check if a user is enrolled in a training
   * @param userId the ID of the user
   * @param trainingId the ID of the training
   * @returns Observable of the enrollment status
   */
  checkEnrollmentStatus(userId: number, trainingId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('trainingId', trainingId.toString());
    
    return this.http.get<boolean>(`${this.apiUrl}/status`, { params });
  }

}
