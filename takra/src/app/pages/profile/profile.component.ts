import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EnrollmentService } from '../../services/enrollment.service';

interface Training {
  trainingId: number;
  title: string;
  description: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // User data
  user = {
    firstName: 'Oussemaa',
    lastName: 'Heni',
    position: 'Directeur',
    department: 'IT',
    email: 'oussema.heni@soprahr.com',
    joinDate: '12/07/2025',
    avatar: '../../../assets/img/user.png'
  };

  // Trainings
  trainings: Training[] = [];
  
  // Filtered training lists
  completedTrainings: Training[] = [];
  inProgressTrainings: Training[] = [];
  plannedTrainings: Training[] = [];
  
  // Current filter
  currentFilter: string = 'all';
  filteredTrainings: Training[] = [];

  constructor(private enrollmentService: EnrollmentService) { }

  ngOnInit(): void {
    // Charger les formations de l'utilisateur
    this.loadUserTrainings();
  }

  loadUserTrainings(): void {
    // Utiliser l'ID 3 comme dans l'exemple de l'API
    this.enrollmentService.getUserEnrollments(3).subscribe({
      next: (data) => {
        this.trainings = data;
        
        // Filtrer les formations par statut
        this.completedTrainings = this.trainings.filter(t => t.status === 'terminer');
        this.inProgressTrainings = this.trainings.filter(t => t.status === 'en_cours');
        this.plannedTrainings = this.trainings.filter(t => t.status === 'planifier');
        
        // Initialiser les formations filtrées
        this.applyFilter('all');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des formations:', error);
      }
    });
  }

  // Appliquer un filtre aux formations
  applyFilter(filter: string): void {
    this.currentFilter = filter;
    
    switch(filter) {
      case 'completed':
        this.filteredTrainings = this.completedTrainings;
        break;
      case 'in-progress':
        this.filteredTrainings = this.inProgressTrainings;
        break;
      case 'planned':
        this.filteredTrainings = this.plannedTrainings;
        break;
      default:
        this.filteredTrainings = this.trainings;
    }
  }

  // Obtenir le texte du statut en fonction du code de statut
  getStatusText(status: string): string {
    switch(status) {
      case 'terminer': return 'Terminé';
      case 'en_cours': return 'En cours';
      case 'planifier': return 'Planifié';
      default: return status;
    }
  }

  // Convertir le statut API en classe CSS
  getStatusClass(status: string): string {
    switch(status) {
      case 'terminer': return 'completed';
      case 'en_cours': return 'in-progress';
      case 'planifier': return 'planned';
      default: return '';
    }
  }
}