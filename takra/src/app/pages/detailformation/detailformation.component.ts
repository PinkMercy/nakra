import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { CommentSectionComponent } from '../comment-section/comment-section.component';
import { FormsModule } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';

interface Formation {
  id: number;
  title: string;
  description: string;
  date: string;
  durationInHours?: number;
  formateur: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  sessions: Session[];
}

interface Session {
  id: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  type: 'ONLINE' | 'INPERSON';
  room: any;
  linkMeet?: string;  // Changé de meetingLink à linkMeet
}

interface TrainingRating {
  averageRating: number;
  ratingCount: number;
}

@Component({
  selector: 'app-detailformation',
  standalone: true,
  imports: [
    CommonModule, 
    CommentSectionComponent, 
    FormsModule,
    NzButtonModule,
    NzModalModule,
    NzIconModule
  ],
  templateUrl: './detailformation.component.html',
  styleUrl: './detailformation.component.scss'
})
export class DetailformationComponent implements OnInit {
  formation: Formation | null = null;
  isLoading = true;
  error: string | null = null;
  currentYear = new Date().getFullYear();
  userId: number | null = null;
  isEnrolled = false;
  isEnrollmentLoading = false;
  userRating = 0;
  trainingRating: TrainingRating = { averageRating: 0, ratingCount: 0 };
  isRatingLoading = false;
  
  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService,
    private notification: NzNotificationService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    console.log('Checking enrollment status for user:', this.userId);
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadFormationDetails(id);
        this.loadTrainingRating(id);
        if (this.userId) {
          this.checkEnrollmentStatus(id);
          this.loadUserEnrollment(this.userId, id);
        }
      } else {
        this.error = 'Formation ID not found';
        this.isLoading = false;
      }
    });
  }

  loadFormationDetails(id: number): void {
    this.isLoading = true;
    this.sessionService.getTrainingById(id).subscribe({
      next: (data) => {
        this.formation = data;
        console.log('Formation details loaded', this.formation);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading formation details', err);
        this.error = 'Failed to load formation details';
        this.isLoading = false;
      }
    });
  }

  loadTrainingRating(trainingId: number): void {
    this.enrollmentService.getTrainingRating(trainingId).subscribe({
      next: (rating) => {
        this.trainingRating = rating;
      },
      error: (err) => {
        console.error('Error loading training rating', err);
      }
    });
  }

  loadUserEnrollment(userId: number, trainingId: number): void {
    this.enrollmentService.getUserEnrollments(userId).subscribe({
      next: (enrollments) => {
        const enrollment = enrollments.find(e => e.trainingId === trainingId);
        if (enrollment) {
          this.userRating = enrollment.userRating || 0;
        }
      },
      error: (err) => {
        console.error('Error loading user enrollment', err);
      }
    });
  }

  checkEnrollmentStatus(formationId: number): void {
    if (!this.userId) return;
    
    this.isEnrollmentLoading = true;
    this.enrollmentService.checkEnrollmentStatus(this.userId, formationId).subscribe({
      next: (enrolled) => {
        this.isEnrolled = enrolled;
        this.isEnrollmentLoading = false;
      },
      error: (err) => {
        console.error('Error checking enrollment status', err);
        this.isEnrollmentLoading = false;
      }
    });
  }
  
  toggleEnrollment(): void {
    if (!this.userId || !this.formation) {
      this.notification.warning('Avertissement', 'Vous devez être connecté pour vous inscrire à une formation');
      return;
    }

    this.isEnrollmentLoading = true;
    
    if (this.isEnrolled) {
      this.enrollmentService.unenrollUser(this.userId, this.formation.id).subscribe({
        next: () => {
          this.isEnrolled = false;
          this.isEnrollmentLoading = false;
          console.log('Successfully unenrolled');
        },
        error: (err) => {
          console.error('Error unenrolling', err);
          this.isEnrollmentLoading = false;
          this.notification.error('Erreur', 'Erreur lors de la désinscription');
        }
      });
    } else {
      const formationDateStr = this.formation.date;
      const formationDate = new Date(formationDateStr);
      
      if (isNaN(formationDate.getTime())) {
        console.error('Invalid formation date:', formationDateStr);
        this.notification.error('Erreur', 'Date de formation invalide');
        this.isEnrollmentLoading = false;
        return;
      }
      
      const currentDate = new Date('2025-05-18T15:02:00+01:00');
      const currentDateMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const formationDateMidnight = new Date(formationDate.getFullYear(), formationDate.getMonth(), formationDate.getDate());
      
      if (currentDateMidnight > formationDateMidnight) {
        this.notification.warning('Avertissement', 'L\'inscription à cette formation est fermée');
        this.isEnrollmentLoading = false;
        return;
      }
      
      this.enrollmentService.enrollUser(this.userId, this.formation.id).subscribe({
        next: () => {
          this.isEnrolled = true;
          this.isEnrollmentLoading = false;
          console.log('Successfully enrolled');
        },
        error: (err) => {
          console.error('Error enrolling', err);
          this.isEnrollmentLoading = false;
          this.notification.error('Erreur', 'Erreur lors de l\'inscription');
        }
      });
    }
  }

  rateTraining(stars: number): void {
    if (!this.userId || !this.formation || !this.isEnrolled) {
      this.notification.warning('Avertissement', 'Vous devez être abonné pour noter cette formation');
      return;
    }

    this.isRatingLoading = true;
    this.enrollmentService.rateTraining(this.userId, this.formation.id, stars).subscribe({
      next: () => {
        this.userRating = stars;
        this.isRatingLoading = false;
        if (this.formation) {
          this.loadTrainingRating(this.formation.id);
        }
      },
      error: (err) => {
        console.error('Error rating training', err);
        this.isRatingLoading = false;
        this.notification.error('Erreur', 'Erreur lors de la notation');
      }
    });
  }

  // Nouvelle méthode pour rejoindre la réunion avec modal Ng-Zorro
  joinMeeting(session: Session): void {
    // Afficher les détails de la session dans la console
    console.log('Session details:', {
      id: session.id,
      date: session.date,
      timeStart: session.timeStart,
      timeEnd: session.timeEnd,
      type: session.type,
      room: session.room,
      linkMeet: session.linkMeet  // Changé de meetingLink à linkMeet
    });

    const currentDate = new Date();
    const sessionDate = new Date(session.date);
    const formationDate = this.formation ? new Date(this.formation.date) : null;
    
    // Vérifier si l'utilisateur est inscrit et si la date système < date de formation
    const canJoinMeeting = this.isEnrolled && 
                          formationDate && 
                          currentDate < formationDate;

    // Créer le contenu de la modal
    let modalContent = `
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 16px; color: #1890ff;">Détails de la session</h3>
        
        <div style="margin-bottom: 12px;">
          <strong>📅 Date:</strong> ${session.date}
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong>⏰ Horaire:</strong> ${this.formatTime(session.timeStart, session.timeEnd)}
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong>📍 Type:</strong> ${session.type === 'ONLINE' ? 'En ligne' : 'Présentiel'}
        </div>
        
        <div style="margin-bottom: 16px;">
          <strong>🏢 Salle:</strong> ${session.room?.name || 'Non spécifiée'}
        </div>
    `;

    if (canJoinMeeting && session.linkMeet) {  // Changé de meetingLink à linkMeet
      modalContent += `
        <div style="padding: 16px; background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; margin-bottom: 16px;">
          <p style="margin: 0 0 12px 0; color: #52c41a; font-weight: 500;">
            ✅ Vous pouvez rejoindre cette session
          </p>
          <div style="margin-top: 12px;">
            <a href="${session.linkMeet}" 
               target="_blank" 
               style="display: inline-block; padding: 8px 16px; background-color: #52c41a; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
              🎥 Rejoindre la réunion
            </a>
          </div>
        </div>
      `;
    } else {
      let reasonMessage = '';
      
      if (!this.isEnrolled) {
        reasonMessage = 'Vous devez être inscrit à cette formation pour rejoindre la session.';
      } else if (formationDate && currentDate >= formationDate) {
        reasonMessage = 'Cette session n\'est plus accessible (date dépassée).';
      } else if (!session.linkMeet) {  // Changé de meetingLink à linkMeet
        reasonMessage = 'Aucun lien de réunion n\'est disponible pour cette session.';
      }
      
      modalContent += `
        <div style="padding: 16px; background-color: #fff2e8; border: 1px solid #ffbb96; border-radius: 6px;">
          <p style="margin: 0; color: #fa8c16; font-weight: 500;">
            ⚠️ ${reasonMessage}
          </p>
        </div>
      `;
    }

    modalContent += '</div>';

    // Afficher la modal Ng-Zorro
    this.modal.info({
      nzTitle: 'Session de formation',
      nzContent: modalContent,
      nzWidth: 500,
      nzOkText: 'Fermer',
      nzCentered: true
    });
  }

  formatTime(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  getFormatterInitials(formateur: { firstname: string, lastname: string }): string {
    return `${formateur.firstname.charAt(0)}${formateur.lastname.charAt(0)}`;
  }
}