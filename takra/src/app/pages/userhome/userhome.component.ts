import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import * as echarts from 'echarts';
import { StatsService } from '../../services/stats.service';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';

interface TrainingStats {
  trainingId: number;
  title: string;
  description: string;
  averageStars: number;
  enrollmentCount: number;
}

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
  topTrainings: TrainingStats[] = [];
  currentPage = 0;
  itemsPerPage = 3;

  constructor(
    private statsService: StatsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrainingStats();
    this.loadTopTrainings();
  }

  loadTopTrainings(): void {
    console.log('🔍 Chargement des formations...');
    this.statsService.getTopTrainingsByStars().subscribe({
      next: (data: TrainingStats[]) => {
        console.log('📊 Données reçues:', data);
        this.topTrainings = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur:', error);
        this.loading = false;
      }
    });
  }

  getCurrentPageTrainings(): TrainingStats[] {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.topTrainings.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.topTrainings.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  getRank(training: TrainingStats): number {
    return this.topTrainings.indexOf(training) + 1;
  }

  // New method to handle training card click
  onTrainingClick(training: TrainingStats): void {
    this.router.navigate(['/home/detailformation', training.trainingId]);
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