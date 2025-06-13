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
  date: string; // Format ISO ou YYYY-MM-DD
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
  date: string; // Format ISO ou YYYY-MM-DD
  timeStart: string;
  timeEnd: string;
  type: 'ONLINE' | 'INPERSON';
  room: any;
  linkMeet?: string;
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
  styleUrls: ['./detailformation.component.scss']
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

  /**
   * Charge les détails de la formation via le service
   */
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

  /**
   * Charge la note moyenne et le nombre d'avis pour la formation
   */
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

  /**
   * Charge les inscriptions de l'utilisateur pour récupérer sa note (si déjà noté)
   */
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

  /**
   * Vérifie si l'utilisateur est inscrit
   */
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

  /**
   * Parse une date au format YYYY-MM-DD en Date locale à minuit
   */
  parseDateOnlyToLocalMidnight(dateStr: string): Date | null {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if ([year, month, day].some(x => isNaN(x))) return null;
    return new Date(year, month - 1, day);
  }

  /**
   * Retourne true si la date de formation est passée par rapport à aujourd'hui
   * @param formationDateStr : date de la formation (ISO ou YYYY-MM-DD)
   * @param considerSameDayAsPast : si true, considère la date du jour comme déjà passée (>=). Si false, permet inscription le jour même.
   */
  isFormationDatePast(formationDateStr: string, considerSameDayAsPast: boolean = false): boolean {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let formationMidnight: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(formationDateStr)) {
      const parsed = this.parseDateOnlyToLocalMidnight(formationDateStr);
      if (!parsed) {
        console.error('Impossible de parser date-only:', formationDateStr);
        return true;
      }
      formationMidnight = parsed;
    } else {
      const fd = new Date(formationDateStr);
      if (isNaN(fd.getTime())) {
        console.error('Date de formation invalide:', formationDateStr);
        return true;
      }
      formationMidnight = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());
    }

    if (considerSameDayAsPast) {
      return todayMidnight >= formationMidnight;
    } else {
      return todayMidnight > formationMidnight;
    }
  }

  /**
   * Affiche-zones d'inscription si formation chargée
   */
  canShowEnrollButton(): boolean {
    return !!this.formation;
  }

  /**
   * Désactive le bouton d'inscription si la date est passée ou en cours de chargement
   */
  isEnrollButtonDisabled(): boolean {
    if (!this.formation) return true;
    // Autorise inscription jusqu'au jour même inclus => considerSameDayAsPast=false
    if (this.isFormationDatePast(this.formation.date, false)) {
      return true;
    }
    if (this.isEnrollmentLoading) {
      return true;
    }
    return false;
  }

  /**
   * Toggle d'inscription/désinscription
   */
  toggleEnrollment(): void {
    if (!this.userId || !this.formation) {
      this.notification.warning('Avertissement', 'Vous devez être connecté pour vous inscrire à une formation');
      return;
    }

    this.isEnrollmentLoading = true;

    if (this.isEnrolled) {
      // Désinscription
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
      // Inscription : vérification de la date
      if (this.isFormationDatePast(this.formation.date, false)) {
        this.notification.warning('Avertissement', 'L\'inscription à cette formation est fermée (date passée).');
        this.isEnrollmentLoading = false;
        return;
      }
      // Appel à l'API d'inscription
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

  /**
   * Notation de la formation par l'utilisateur
   */
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

  /**
   * Ouvre une modal Ng-Zorro pour rejoindre la réunion
   */
  joinMeeting(session: Session): void {
    console.log('Session details:', session);
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let formationMidnight: Date | null = null;
    if (this.formation) {
      const dateStr = this.formation.date;
      const parsed = this.parseDateOnlyToLocalMidnight(dateStr);
      if (parsed) {
        formationMidnight = parsed;
      } else {
        const fd = new Date(dateStr);
        if (!isNaN(fd.getTime())) {
          formationMidnight = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());
        }
      }
    }
    // Autorise jusqu'au jour même inclus
    const canJoinMeeting = this.isEnrolled && formationMidnight && (todayMidnight <= formationMidnight);

    // Construction du contenu de la modal
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

    if (canJoinMeeting && session.linkMeet) {
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
      } else if (formationMidnight && todayMidnight > formationMidnight) {
        reasonMessage = 'Cette session n\'est plus accessible (date dépassée).';
      } else if (!session.linkMeet) {
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

    // Affichage de la modal Ng-Zorro
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

  getFormatterInitials(formateur: { firstname: string; lastname: string }): string {
    return `${formateur.firstname.charAt(0)}${formateur.lastname.charAt(0)}`;
  }
}
