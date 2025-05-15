import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { StatsService } from '../../services/stats.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-trainingstats',
  imports: [CommonModule],
  templateUrl: './trainingstats.component.html',
  styleUrl: './trainingstats.component.scss'
})
export class TrainingstatsComponent implements OnInit {
chartInstance: any;
  chartOptions: any;
  isLoading = true;
  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.loadTrainingStats();
  }

  loadTrainingStats(): void {
    this.isLoading = true;
    this.statsService.getStatueTrainingsPerMonth().subscribe(data => {
      this.initChart(data);
      this.isLoading = false;
    });
  }

  initChart(data: any): void {
    // Define colors for each status
    const colors = {
      'Terminé': '#66BB6A',  // Green
      'En cours': '#FFB74D', // Orange
      'Planifié': '#4E7FE1'  // Blue
    };

    // Apply colors to the data
    const seriesData = data.data.map((item: { name: 'Terminé' | 'En cours' | 'Planifié', value: number }) => {
          return {
            value: item.value,
            name: item.name,
            itemStyle: {
              color: colors[item.name]
            }
          };
        });

    this.chartOptions = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        top: '5%',
        left: 'center',
        data: seriesData.map((item: any) => item.name)
      },
      title: {
        text: `Formations du mois de ${data.currentMonth}`,
        left: 'center',
        top: '85%',
        textStyle: {
          fontSize: 16
        }
      },
      series: [
        {
          name: 'État des formations',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          startAngle: 180,
          endAngle: 360,
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          data: seriesData
        }
      ]
    };

    // Initialize chart after view is ready
    setTimeout(() => {
      const chartElement = document.getElementById('training-stats-chart');
      if (chartElement) {
        this.chartInstance = echarts.init(chartElement);
        this.chartInstance.setOption(this.chartOptions);
        
        // Handle resize
        window.addEventListener('resize', () => {
          if (this.chartInstance) {
            this.chartInstance.resize();
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
    window.removeEventListener('resize', () => {});
  }
}
