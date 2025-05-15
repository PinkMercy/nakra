import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';

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
  imports: [CommonModule, NzNotificationModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // User data
  user = {
    firstName: '',
    lastName: '',
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

  constructor(
    private enrollmentService: EnrollmentService,
    private authService: AuthService,
    private notification: NzNotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initUserData();
    // Charger les formations de l'utilisateur
    this.loadUserTrainings();
  }

  initUserData(): void {
    const me = this.authService.getUser();
    if (me) {
      this.user.firstName = me.firstname;
      this.user.lastName = me.lastname;
      this.user.email = me.email;
      // if you also have me.role or me.joinDate, you can set them here too
    }
  }

  loadUserTrainings(): void {
    const token = this.authService.getToken();
    const userId = this.authService.getUserId();
    
    if (!token || !userId) {
      this.handleInvalidSession();
      return;
    }

    // Validate token first
    this.authService.validateToken(token).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.fetchUserTrainings(userId);
        } else {
          this.handleInvalidSession();
        }
      },
      error: (error) => {
        console.error('Error validating token:', error);
        this.handleInvalidSession();
      }
    });
  }
  
  private fetchUserTrainings(userId: number): void {
    this.enrollmentService.getUserEnrollments(userId).subscribe({
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
        // Check if the error is due to unauthorized access (401)
        if (error.status === 401) {
          this.handleInvalidSession();
        }
      }
    });
  }

  private handleInvalidSession(): void {
    // Clear authentication data
    this.authService.clearLocalStorage();
    
    // Show notification
    this.notification.error(
      'Session terminée',
      'Votre session a expiré. Veuillez vous reconnecter.',
      { nzDuration: 5000, nzPlacement: 'bottomRight' }
    );
    
    // Navigate to login page
    this.router.navigate(['/login']);
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