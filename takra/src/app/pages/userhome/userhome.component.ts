import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import * as echarts from 'echarts';
import { StatsService } from '../../services/stats.service';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';

@Component({
  selector: 'app-userhome',
  imports: [CommonModule, HttpClientModule, NgxEchartsModule],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts }),
    },
  ],
  templateUrl: './userhome.component.html',
  styleUrl: './userhome.component.scss'
})
export class UserhomeComponent {
  chartOptions: echarts.EChartsOption = {};
  loading = true;
  totalUsers: number = 0;
  avgHourlyTraining: number = 0;
  totalTrainings: number = 0;

  // Ajout des formations statiques pour le mois en cours
  formationsDuMois = [
    {
      nom: 'Formation Angular Avancé',
      description: 'Approfondissez vos connaissances en Angular avec des concepts avancés.',
      date: '2025-05-20'
    },
    {
      nom: 'Atelier NgZorro',
      description: 'Découvrez comment utiliser NgZorro pour améliorer l\'UI de vos applications.',
      date: '2025-05-25'
    }
  ];

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.loadTrainingStats();
    this.loadStaticStats();
  }

  loadTrainingStats(): void {
    this.statsService.getTrainingsPerMonth().subscribe({
      next: (data) => {
        this.updateChartOptions(data.months, data.counts);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.loading = false;
      },
    });
  }
  
  loadStaticStats(): void {
    this.statsService.getTotalTrainingsAndUsers().subscribe({
      next: stats => {
        this.totalUsers = stats.totalUsers;
        this.avgHourlyTraining = stats.avgHourlyTraining;
        this.totalTrainings = stats.totalTrainings;
      },
      error: err => console.error('Erreur stats statiques:', err)
    });
  }
  
  updateChartOptions(months: string[], counts: number[]): void {
    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Nombre de formations',
        minInterval: 1,
      },
      series: [
        {
          name: 'Formations',
          data: counts,
          type: 'bar',
          itemStyle: {
            color: '#1890ff',
          },
          emphasis: {
            itemStyle: {
              color: '#40a9ff',
            },
          },
          label: {
            show: true,
            position: 'top',
          },
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
    };
  }
}