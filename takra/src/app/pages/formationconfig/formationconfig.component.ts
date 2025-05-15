import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { SessionService } from '../../services/session/session.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService, NzMessageModule } from 'ng-zorro-antd/message';
import { RoomService } from '../../services/room.service';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { EnrollmentService } from '../../services/enrollment.service';

export interface Session {
  roomId: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  linkMeet: string;
  type: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  durationInHours: number;
  formateurEmail: string;
  type: string;
  sessions: Session[];
}

export interface Room {
  id: number;
}

@Component({
  selector: 'app-formationconfig',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzSelectModule,
    NzMessageModule,
  ],
  templateUrl: './formationconfig.component.html',
  styleUrl: './formationconfig.component.scss'
})
export class FormationconfigComponent implements OnInit {
  selectedUsers: number[] = [];
  events: Event[] = [];
  rooms: Room[] = [];
  users: User[] = [];
  modalForm!: FormGroup;
  isSubmitting = false;
  private modalRef!: NzModalRef;
  private editingId: number | null = null;
  enrolledUsers: User[] = [];
  eventForInvitation: Event | null = null;
  inviteModalRef!: NzModalRef;
  inviteForm!: FormGroup;
  
  @ViewChild('modalFormTemplate', { static: true }) modalFormTemplate!: TemplateRef<any>;
  @ViewChild('inviteModalTemplate', { static: true }) inviteModalTemplate!: TemplateRef<any>;
  
  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private roomService: RoomService,
    private modal: NzModalService,
    private message: NzMessageService,
    private enrollmentService: EnrollmentService,
    private userService: UserService,
  ) {}

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: data => {
        this.users = data;
        console.log('Utilisateurs chargés:', this.users);
      },
      error: err => {
        console.error('Erreur de chargement des utilisateurs:', err);
        this.message.error('Échec du chargement des utilisateurs');
      }
    });
  }

  private buildInviteForm(): void {
    this.inviteForm = this.fb.group({
      selectedUsers: [[], [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadRooms();
    this.loadEvents();
    this.loadUsers();
    this.buildForm();
    this.buildInviteForm();
  }

  private buildForm(): void {
    this.modalForm = this.fb.group({
      title: [null, [Validators.required]],
      description: [null, [Validators.required]],
      type: ['OFFLINE', [Validators.required]],
      durationInHours: [null, [Validators.required, Validators.min(1)]],
      formateurEmail: [null, [Validators.required, Validators.email]],
      sessions: this.fb.array([])
    });
  }

  get sessions(): FormArray {
    return this.modalForm.get('sessions') as FormArray;
  }

  private loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: data => {
        this.rooms = data;
        console.log('Salles chargées:', this.rooms);
      },
      error: err => {
        console.error('Erreur de chargement des salles:', err);
        this.message.error('Échec du chargement des salles');
      }
    });
  }

  private loadEvents(): void {
    this.sessionService.getEvents().subscribe({
      next: data => {
        this.events = (data as any[]).map(event => ({
          ...event,
          formateurEmail: event.formateurEmail || ''
        })) as Event[];
        console.log('Formations chargées:', this.events);
        // Format dates for display
        this.events = this.events.map(event => ({
          ...event,
          date: new Date(event.date).toLocaleDateString('fr-FR')
        }));
      },
      error: err => {
        console.error('Erreur de chargement des formations:', err);
        this.message.error('Échec du chargement des formations');
      }
    });
  }

  addSession(data?: Session): void {
    this.sessions.push(
      this.fb.group({
        roomId: [data?.roomId || null, [Validators.required]],
        date: [data?.date ? new Date(data.date) : null, [Validators.required]],
        timeStart: [data?.timeStart || null, [Validators.required]],
        timeEnd: [data?.timeEnd || null, [Validators.required]],
        linkMeet: [data?.linkMeet || '', [Validators.required]],
        type: [data?.type || 'OFFLINE', [Validators.required]]
      })
    );
  }

  removeSession(i: number): void {
    this.sessions.removeAt(i);
  }

  openModal(isEdit = false, ev?: Event): void {
    this.editingId = isEdit ? ev!.id : null;
    this.sessions.clear();
    this.modalForm.reset();
    
    // Set default type
    this.modalForm.patchValue({ type: 'OFFLINE' });

    if (isEdit && ev) {
      // For edit mode, fetch the latest data
      this.sessionService.getTrainingById(ev.id).subscribe({
        next: (updatedEvent) => {
          console.log('Formation récupérée pour modification:', updatedEvent);
          this.patchFormWithEventData(updatedEvent);
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des détails:', err);
          this.message.error('Échec du chargement des détails de la formation');
          this.patchFormWithEventData(ev);
        }
      });
    } else {
      // For new event, just add an empty session
      this.addSession();
    }
    
    this.modalRef = this.modal.create({
      nzTitle: isEdit ? 'Modifier Formation' : 'Ajouter Formation',
      nzContent: this.modalFormTemplate,
      nzWidth: '800px',
      nzOnOk: () => this.onSubmit(),
      nzOkText: isEdit ? 'Mettre à jour' : 'Créer',
      nzCancelText: 'Annuler',
      nzOnCancel: () => this.modalForm.reset()
    });
  }

  openModalInvite(isEdit = false, ev?: Event): void {
    if (!ev) {
      this.message.error('Aucune formation sélectionnée');
      return;
    }
    
    this.eventForInvitation = ev;
    console.log('Invitation à la formation:', ev);
    
    this.inviteForm.reset();
    this.selectedUsers = [];
    
    // Charger les utilisateurs déjà inscrits
    this.loadEnrolledUsers(ev.id);
    
    this.inviteModalRef = this.modal.create({
      nzTitle: `Inviter des utilisateurs à la formation: ${ev.title}`,
      nzContent: this.inviteModalTemplate,  
      nzWidth: '600px',
      nzOnOk: () => this.submitInvitations(ev.id),
      nzOkText: 'Inviter',
      nzCancelText: 'Annuler'
    });
  }

  submitInvitations(eventId: number): boolean | void {
    if (this.inviteForm.invalid) {
      Object.values(this.inviteForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return false;
    }
    
    const selectedUsers = this.inviteForm.get('selectedUsers')?.value;
    
    if (!selectedUsers || selectedUsers.length === 0) {
      this.message.warning('Veuillez sélectionner au moins un utilisateur');
      return false;
    }
    
    console.log('Invitations pour la formation:', eventId);
    console.log('Utilisateurs sélectionnés:', selectedUsers);
    
    this.enrollmentService.inviteUsers(eventId, selectedUsers).subscribe({
      next: () => {
        this.message.success('Invitations envoyées avec succès');
        this.inviteModalRef.close();
      },
      error: err => {
        console.error('Erreur lors de l\'envoi des invitations:', err);
        this.message.error(`Échec de l'envoi des invitations: ${err.error?.message || err.message || 'Erreur inconnue'}`);
      }
    });
  }
  
  private patchFormWithEventData(ev: Event): void {
    this.modalForm.patchValue({
      title: ev.title,
      description: ev.description,
      type: ev.type || 'OFFLINE',
      durationInHours: ev.durationInHours,
      formateurEmail: ev.formateurEmail
    });
    
    // Add each session to form array
    if (ev.sessions && ev.sessions.length > 0) {
      ev.sessions.forEach(s => this.addSession(s));
    } else {
      // Add at least one empty session
      this.addSession();
    }
  }

  onSubmit(): boolean | void {
    if (this.modalForm.invalid) {
      this.markAllTouched(this.modalForm);
      return false; // prevent modal from closing
    }

    if (this.sessions.length === 0) {
      this.message.warning('Veuillez ajouter au moins une session');
      return false;
    }

    this.isSubmitting = true;

    // build payload with ISO dates
    const raw = this.modalForm.getRawValue();
    const firstSession = raw.sessions[0];
    
    console.log('Valeurs du formulaire avant soumission:', raw);
    
    const payload = {
      title: raw.title,
      description: raw.description,
      type: raw.type,
      // Use first session date as the event date
      date: firstSession.date instanceof Date ? firstSession.date.toISOString().split('T')[0] : firstSession.date,
      durationInHours: raw.durationInHours,
      formateurEmail: raw.formateurEmail,
      sessions: raw.sessions.map((s: any) => ({
        roomId: Number(s.roomId),
        date: s.date instanceof Date ? s.date.toISOString().split('T')[0] : s.date,
        timeStart: s.timeStart,
        timeEnd: s.timeEnd,
        linkMeet: s.linkMeet || '',
        type: s.type
      }))
    };
    
    console.log('Payload à envoyer:', payload);

    const obs = this.editingId
      ? this.sessionService.updateEvent(this.editingId, payload)
      : this.sessionService.addEvent(payload);

    obs.subscribe({
      next: (response) => {
        console.log('Réponse reçue:', response);
        this.isSubmitting = false;
        this.message.success(this.editingId ? 'Formation mise à jour avec succès!' : 'Formation créée avec succès!');
        this.loadEvents(); // Recharger les événements
        this.modalForm.reset();
        this.modalRef.close();
      },
      error: err => {
        this.isSubmitting = false;
        console.error('Erreur lors de la sauvegarde:', err);
        this.message.error(
          this.editingId 
            ? `Échec de la mise à jour: ${err.error?.message || err.message || 'Erreur inconnue'}` 
            : `Échec de la création: ${err.error?.message || err.message || 'Erreur inconnue'}`
        );
      }
    });
  }

  deleteEvent(eventId: number): void {
    this.modal.confirm({
      nzTitle: 'Êtes-vous sûr de vouloir supprimer cette formation ?',
      nzContent: 'Cette action est irréversible.',
      nzOkText: 'Oui',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Non',
      nzOnOk: () => {
        this.sessionService.deleteEvent(eventId).subscribe({
          next: () => {
            this.message.success('Formation supprimée avec succès!');
            this.loadEvents(); // Reload events
          },
          error: err => {
            console.error('Erreur lors de la suppression:', err);
            this.message.error(`Échec de la suppression: ${err.error?.message || err.message || 'Erreur inconnue'}`);
          }
        });
      }
    });
  }

  private markAllTouched(group: FormGroup | FormArray): void {
    Object.values(group['controls']).forEach(ctrl => {
      ctrl.markAsTouched();
      if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
        this.markAllTouched(ctrl);
      }
    });
  }

  private loadEnrolledUsers(eventId: number): void {
    this.enrollmentService.getTrainingEnrollments(eventId).subscribe({
      next: enrollments => {
        // Extraire les IDs des utilisateurs inscrits
        const enrolledUserIds = enrollments.map(enrollment => enrollment.userId);
        
        // Filtrer les utilisateurs déjà inscrits
        this.enrolledUsers = this.users.filter(user => 
          enrolledUserIds.includes(user.id)
        );
        
        console.log('Utilisateurs inscrits:', this.enrolledUsers);
      },
      error: err => {
        console.error('Erreur lors du chargement des inscriptions:', err);
        this.message.error('Échec du chargement des inscriptions');
      }
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter(u => !this.enrolledUsers.some(eu => eu.id === u.id));
  }

  removeUser(userId: number, event?: MouseEvent): void {
    // Empêcher la propagation pour éviter que le clic ne ferme la modal
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!this.eventForInvitation) {
      this.message.error('Aucune formation sélectionnée');
      return;
    }

    // Demander confirmation avant de supprimer
    this.modal.confirm({
      nzTitle: 'Êtes-vous sûr de vouloir supprimer cet utilisateur de la formation ?',
      nzOkText: 'Oui',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Non',
      nzOnOk: () => {
        // Appeler le service pour désinscrire l'utilisateur
        this.enrollmentService.unenrollUserFromTraining(userId, this.eventForInvitation!.id).subscribe({
          next: () => {
            this.message.success('Utilisateur supprimé de la formation avec succès');
            // Mettre à jour la liste des utilisateurs inscrits
            this.loadEnrolledUsers(this.eventForInvitation!.id);
          },
          error: err => {
            console.error('Erreur lors de la suppression de l\'utilisateur:', err);
            this.message.error(`Échec de la suppression: ${err.error?.message || err.message || 'Erreur inconnue'}`);
          }
        });
      }
    });
  }
}