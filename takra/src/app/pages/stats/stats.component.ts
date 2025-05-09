import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import * as echarts from 'echarts';
import { StatsService } from '../../services/stats.service';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgxEchartsModule
  ],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts })
    }
  ],
  template: `
    <div class="stats-container">
      <h2>Nombre de formations par mois</h2>
      <div 
        echarts 
        [options]="chartOptions" 
        class="chart"
        [loading]="loading"
      ></div>
    </div>
  `,
  styles: [`
    .stats-container {
      width: 100%;
      padding: 20px;
    }
    .chart {
      height: 400px;
      width: 100%;
    }
    h2 {
      text-align: center;
      margin-bottom: 20px;
    }
  `]
})
export class StatsComponent implements OnInit {
  chartOptions: echarts.EChartsOption = {};
  loading = true;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.loadTrainingStats();
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
      }
    });
  }

  updateChartOptions(months: string[], counts: number[]): void {
    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Nombre de formations',
        minInterval: 1
      },
      series: [
        {
          name: 'Formations',
          data: counts,
          type: 'bar',
          itemStyle: {
            color: '#1890ff'
          },
          emphasis: {
            itemStyle: {
              color: '#40a9ff'
            }
          },
          label: {
            show: true,
            position: 'top'
          }
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      }
    };
  }
}