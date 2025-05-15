import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
export interface StatsSummary {
  totalUsers: number;
  avgHourlyTraining: number;
  totalTrainings: number;
}
@Injectable({
  providedIn: 'root'
})
export class StatsService {
  constructor(private http: HttpClient) {}
private apiUrl = 'http://localhost:8080/api/stats';
  getTrainingsPerMonth(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/stats/trainings-per-mont')
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


  getStatueTrainingsPerMonth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statuetrainings-per-month`)
      .pipe(
        catchError(error => {
          console.error('Error fetching training statistics:', error);
          // Return mock data in case of error
          return of(this.getMockData_2());
        })
      );
  }

  private getMockData_2(): any {
    return {
      currentMonth: 'Mai',
      data: [
        { value: 12, name: 'Terminé' },
        { value: 5, name: 'En cours' },
        { value: 8, name: 'Planifié' }
      ]
    };
  }
  getTotalTrainingsAndUsers(): Observable<StatsSummary> {
    return this.http.get<StatsSummary>(`${this.apiUrl}/total-trainings-and-users`);
  }
}