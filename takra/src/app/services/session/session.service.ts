import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../../models/session'; // Import your Event model

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:8080/admin/trainings/create'; // Update with your backend URL for events

  constructor(private http: HttpClient) {}

  // Retrieve events
  getEvents(): Observable<Event[]> {
    const username = 'admin';
    const password = 'admin';
    const basicAuth = this.getBasicAuthHeader(username, password);

    return this.http.get<Event[]>(this.apiUrl, {
      headers: {
        Authorization: basicAuth
      }
    });
  }

  // Create an event
  addEvent(eventData: Event): Observable<any> {
    const url = this.apiUrl; // Using the same endpoint as for fetching events
    const username = 'admin';
    const password = 'admin';
    const basicAuth = this.getBasicAuthHeader(username, password);

    return this.http.post(url, eventData, {
      headers: {
        Authorization: basicAuth
      }
    });
  }

  // Update an event
  updateEvent(id: number, eventData: Partial<Event>): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const username = 'admin';
    const password = 'admin';
    const basicAuth = this.getBasicAuthHeader(username, password);

    return this.http.put(url, eventData, {
      headers: {
        Authorization: basicAuth
      }
    });
  }

  // Delete an event
  deleteEvent(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const username = 'admin';
    const password = 'admin';
    const basicAuth = this.getBasicAuthHeader(username, password);

    return this.http.delete(url, {
      headers: {
        Authorization: basicAuth
      }
    });
  }

  private getBasicAuthHeader(username: string, password: string): string {
    const credentials = btoa(`${username}:${password}`);
    return `Basic ${credentials}`;
  }
}
