
import { Injectable } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
interface EnrollmentRequest {
  userId: number;
  trainingId: number;
}

interface RatingRequest {
  userId: number;
  trainingId: number;
  stars: number;
}

interface TrainingRating {
  averageRating: number;
  ratingCount: number;
}
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
//get all enrollments for a user
  getUserEnrollments(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }
  
  //get all enrollments for a training
  rateTraining(userId: number, trainingId: number, stars: number): Observable<any> {
    const request: RatingRequest = { userId, trainingId, stars };
    return this.http.put(`${this.apiUrl}/rate`, request);
  }

  //get the average rating and count of ratings for a training
  getTrainingRating(trainingId: number): Observable<TrainingRating> {
    return this.http.get<TrainingRating>(`${this.apiUrl}/training/${trainingId}/rating`);
  }

   // Méthode pour inviter des utilisateurs à une formation
  inviteUsers(eventId: number, userIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/invitations`, { userIds });
  }
  
}
