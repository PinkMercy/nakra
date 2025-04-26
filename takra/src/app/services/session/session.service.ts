import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../../models/session'; // Import your Event model

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

  // Retrieve events
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  // Create an event
  addEvent(eventData: Event): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, eventData, {
      headers: this.getAuthHeaders()
    });
  }

  // Update an event
  updateEvent(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  // Delete an event
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }
}

