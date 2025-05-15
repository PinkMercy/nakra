import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import * as echarts from 'echarts';
import { StatsService } from '../../services/stats.service';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { TrainingstatsComponent } from '../trainingstats/trainingstats.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxEchartsModule,
    TrainingstatsComponent,
  ],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts }),
    },
  ],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  chartOptions: echarts.EChartsOption = {};
  loading = true;
  totalUsers: number = 0;
  avgHourlyTraining: number = 0;
  totalTrainings: number = 0;

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
    // Assume StatsService provides these metrics
    this.statsService.getTrainingsPerMonth().subscribe({
      next: (data) => {
        this.totalUsers = data.totalUsers;
        this.avgHourlyTraining = data.avgHourlyTraining;
        this.totalTrainings = data.totalTrainings;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stats statiques:', error);
      },
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