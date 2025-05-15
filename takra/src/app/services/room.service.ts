import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:8080/api/rooms';
  constructor(private http: HttpClient) { }

  // Helper to get the token from localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  //gett all room
  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders()
    });
  }
  //add room
  addRoom(room: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, room, {
      headers: this.getAuthHeaders()
    });
  }
  //delete room
  deleteRoom(roomId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${roomId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
