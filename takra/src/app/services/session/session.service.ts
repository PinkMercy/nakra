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
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Event } from '../../models/session'; // Import your Event model

// @Injectable({
//   providedIn: 'root'
// })
// export class SessionService {
//   private apiUrl = 'http://localhost:8080/admin/trainings/create'; // Update with your backend URL for events

//   constructor(private http: HttpClient) {}

//   // Retrieve events
//   getEvents(): Observable<Event[]> {
//     const username = 'admin';
//     const password = 'admin';
//     const basicAuth = this.getBasicAuthHeader(username, password);

//     return this.http.get<Event[]>('http://localhost:8080/admin/trainings/all', {
//       headers: {
//         Authorization: basicAuth
//       }
//     });
//   }

//   // Create an event
//   addEvent(eventData: Event): Observable<any> {
//     const url = this.apiUrl; // Using the same endpoint as for fetching events
//     const username = 'admin';
//     const password = 'admin';
//     const basicAuth = this.getBasicAuthHeader(username, password);

//     return this.http.post(url, eventData, {
//       headers: {
//         Authorization: basicAuth
//       }
//     });
//   }

//   // Update an event
//   updateEvent(id: number, payload: any): Observable<any> {
//     const url = `http://localhost:8080/admin/trainings/update/${id}`;
//     const username = 'admin';
//     const password = 'admin';
//     const basicAuth = this.getBasicAuthHeader(username, password);
  
//     return this.http.put(url, payload, {
//       headers: { Authorization: basicAuth }
//     });
//   }

//   // Delete an event
//  deleteEvent(id: number): Observable<any> {
//   const url = `http://localhost:8080/admin/trainings/delete/${id}`;
//   const username = 'admin';
//   const password = 'admin';
//   const basicAuth = this.getBasicAuthHeader(username, password);

//   return this.http.delete(url, {
//     headers: { Authorization: basicAuth },
//     responseType: 'text'
//   });
// }


//   private getBasicAuthHeader(username: string, password: string): string {
//     const credentials = btoa(`${username}:${password}`);
//     return `Basic ${credentials}`;
//   }
// }
