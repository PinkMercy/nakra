import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Event } from '../../models/session'; // Import your Event model
import { ApiResponse } from '../../models/ApiResponse'; // Import your ApiResponse model


@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:8080/admin/trainings';

  constructor(private http: HttpClient) {}

  // Helper to get the token from localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getEvents(): Observable<Event[]> {
    return this.http
      .get<ApiResponse<Event[]>>(`${this.apiUrl}/all`, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(response => {
          if (response.success) {
            // when success is true, emit the actual data array
            return response.data;
          } else {
            // when success is false, throw an error to be caught below
            throw new Error(response.message);
          }
        }),
        catchError(err => {
          // err may be an HttpErrorResponse or the Error we threw above
          const errMsg = err.message || 'Unknown server error';
          // re-throw a user-friendly error
          return throwError(() => errMsg);
        })
      );
  }

   // Create a new event
  addEvent(eventData: Event): Observable<Event> {
    return this.http
      .post<ApiResponse<Event>>(`${this.apiUrl}/create`, eventData, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(err => this.handleError(err))
      );
  }

  // Update an existing event
  updateEvent(id: number, payload: Partial<Event>): Observable<Event> {
    return this.http
      .put<ApiResponse<Event>>(`${this.apiUrl}/update/${id}`, payload, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(response => this.handleResponse(response)),
        catchError(err => this.handleError(err))
      );
  }

  // Delete an event
  deleteEvent(id: number): Observable<string> {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl}/delete/${id}`, {
        headers: this.getAuthHeaders(),
        responseType: 'json' as 'json'
      })
      .pipe(
        map(response => response.success ? response.message : this.throwError(response.message)),
        catchError(err => this.handleError(err))
      );
  }

  getTrainingById(id: number): Observable<any> {
    return this.http
      .get<ApiResponse<Event>>(`${this.apiUrl}/${id}`, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map(response => {
          // log full training
          const training = this.handleResponse(response);
          console.log('Full training details:', training);
          return training;
        }),
        catchError(err => this.handleError(err))
      );
  }


   // centralized success handler
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message);
  }

  // centralized error handler
 private handleError(err: any): Observable<never> {
  return throwError(() => err);  // Return the full error object
}

  // helper to throw within map
  private throwError(message: string): never {
    throw new Error(message);
  }

}

