import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
interface Training {
  id: number;
  title: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned';
  score?: number;
  certificate?: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  avatar: string;
  joinDate: string;
  trainings: Training[];
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  // User data
  user: User = {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@company.com',
    department: 'IT',
    position: 'Développeur Full Stack',
    avatar: 'https://via.placeholder.com/120',
    joinDate: '15/03/2020',
    trainings: [
      {
        id: 1,
        title: 'Angular Avancé',
        date: '10/01/2023',
        status: 'completed',
        score: 92,
        certificate: 'CERT-ANG-2023'
      },
      {
        id: 2,
        title: 'DevOps pour Développeurs',
        date: '05/03/2023',
        status: 'completed',
        score: 88,
        certificate: 'CERT-DEVOPS-2023'
      },
      {
        id: 3,
        title: 'Sécurité Web',
        date: '20/06/2023',
        status: 'in-progress'
      },
      {
        id: 4,
        title: 'Architecture Microservices',
        date: '15/09/2023',
        status: 'planned'
      },
      {
        id: 5,
        title: 'React Native',
        date: '10/11/2023',
        status: 'planned'
      },
      {
        id: 6,
        title: 'Introduction à Docker',
        date: '03/12/2022',
        status: 'completed',
        score: 95,
        certificate: 'CERT-DOCKER-2022'
      }
    ]
  };

  // Filtered training lists
  completedTrainings: Training[] = [];
  inProgressTrainings: Training[] = [];
  plannedTrainings: Training[] = [];
  
  // Current filter
  currentFilter: string = 'all';
  filteredTrainings: Training[] = [];

  constructor() { }

  ngOnInit(): void {
    // Filter trainings by status
    this.completedTrainings = this.user.trainings.filter(t => t.status === 'completed');
    this.inProgressTrainings = this.user.trainings.filter(t => t.status === 'in-progress');
    this.plannedTrainings = this.user.trainings.filter(t => t.status === 'planned');
    
    // Initialize filtered trainings with all trainings
    this.applyFilter('all');
  }

  // Apply filter to trainings
  applyFilter(filter: string): void {
    this.currentFilter = filter;
    
    if (filter === 'all') {
      this.filteredTrainings = this.user.trainings;
    } else {
      this.filteredTrainings = this.user.trainings.filter(t => t.status === filter);
    }
  }

  // Get status text based on status code
  getStatusText(status: string): string {
    switch(status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'planned': return 'Planifié';
      default: return '';
    }
  }
}
