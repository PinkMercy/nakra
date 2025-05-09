import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  constructor(private http: HttpClient) {}

  getTrainingsPerMonth(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/stats/trainings-per-month')
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des stats:', error);
          // Retourner des données fictives en cas d'erreur
          return of(this.getMockData());
        })
      );
  }

  private getMockData(): any {
    return {
      months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      counts: [5, 8, 12, 6, 9, 4, 7, 3, 10, 11, 8, 6]
    };
  }
}