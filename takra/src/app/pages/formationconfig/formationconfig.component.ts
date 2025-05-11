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
import { User } from '../../models/user'; // Import the User model
import { EnrollmentService } from '../../services/enrollment.service';
export interface Session {
  roomId: number; // Changed from 'room' to 'roomId'
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
  id: number;  // Make sure this is a number to match roomId
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
  enrolledUsers: User[] = []; // Pour stocker les utilisateurs déjà inscrits
  eventForInvitation: Event | null = null; // Pour stocker l'événement sélectionné pour invitation
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
// 4. Ajoutez cette méthode pour charger les utilisateurs
private loadUsers(): void {
  this.userService.getUsers().subscribe({
    next: data => {
      this.users = data;
      console.log('Loaded users:', this.users);
    },
    error: err => {
      console.error('Error loading users:', err);
      this.message.error('Échec du chargement des utilisateurs');
    }
  });
}
// 6. Méthode pour construire le formulaire d'invitation
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
      date: [null, [Validators.required]],
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
        console.log('Loaded rooms:', this.rooms); // For debugging
      },
      error: err => {
        console.error('Error loading rooms:', err);
        this.message.error('Failed to load rooms');
      }
    });
  }

  private loadEvents(): void {
    this.sessionService.getEvents().subscribe({
      next: data => {
        this.events = (data as any[]).map(event => ({
          ...event,
          formateurEmail: event.formateurEmail || '' // Provide a default value if missing
        })) as Event[];
        console.log('Loaded events:', this.events); // For debugging
        // Format dates for display if needed
        this.events = this.events.map(event => ({
          ...event,
          date: new Date(event.date).toLocaleDateString()
        }));
      },
      error: err => {
        console.error('Error loading events:', err);
        this.message.error('Failed to load formations');
      }
    });
  }

  addSession(data?: Session): void {
    this.sessions.push(
      this.fb.group({
        roomId: [data?.roomId || null, Validators.required], // Changed to roomId
        date: [data?.date ? new Date(data.date) : null, Validators.required],
        timeStart: [data?.timeStart || null, Validators.required],
        timeEnd: [data?.timeEnd || null, Validators.required],
        linkMeet: [data?.linkMeet || '', Validators.required], // Empty string as default
        type: [data?.type || 'OFFLINE', Validators.required]
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
      // For edit mode, fetch the latest data to ensure it's up-to-date
      this.sessionService.getTrainingById(ev.id).subscribe({
        next: (updatedEvent) => {
          console.log('Fetched event for editing:', updatedEvent); // For debugging
          this.patchFormWithEventData(updatedEvent);
        },
        error: (err) => {
          console.error('Error fetching event details:', err);
          this.message.error('Failed to load event details');
          // Still attempt to patch with the data we have
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

 // 2. Modifiez la méthode openModalInvite pour charger les utilisateurs inscrits
openModalInvite(isEdit = false, ev?: Event): void {
  if (!ev) {
    this.message.error('Aucune formation sélectionnée');
    return;
  }
  
  this.eventForInvitation = ev;
  console.log('Inviting users to event:', ev);
  
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
  // 8. Méthode pour soumettre les invitations
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
  
  console.log('Inviting users to event:', eventId);
  console.log('Selected users:', selectedUsers);
  
  
 
  this.enrollmentService.inviteUsers(eventId, selectedUsers).subscribe({
    next: () => {
      this.message.success('Invitations envoyées avec succès');
      this.inviteModalRef.close();
    },
    error: err => {
      console.error('Error sending invitations:', err);
      this.message.error(`Échec de l'envoi des invitations: ${err.error?.message || err.message || 'Erreur inconnue'}`);
    }
  });
  
  // Pour l'instant, on ferme simplement la modal et affiche un message
  this.message.success('Liste des invitations affichée dans la console');
  this.inviteModalRef.close();
}
  
  
  private patchFormWithEventData(ev: Event): void {
    // Convert string date to Date object for date picker
    const eventDate = ev.date ? new Date(ev.date) : null;
    
    this.modalForm.patchValue({
      title: ev.title,
      description: ev.description,
      type: ev.type || 'OFFLINE',
      date: eventDate,
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

    this.isSubmitting = true;

    // build payload with ISO dates
    const raw = this.modalForm.getRawValue();
    
    // Log the form values
    console.log('Form values before submission:', raw);
    
    const payload = {
      title: raw.title,
      description: raw.description,
      type: raw.type,
      date: raw.date instanceof Date ? raw.date.toISOString().split('T')[0] : raw.date,
      durationInHours: raw.durationInHours,
      formateurEmail: raw.formateurEmail,
      sessions: raw.sessions.map((s: any) => ({
        roomId: Number(s.roomId), // Ensure roomId is a number
        date: s.date instanceof Date ? s.date.toISOString().split('T')[0] : s.date,
        timeStart: s.timeStart,
        timeEnd: s.timeEnd,
        linkMeet: s.linkMeet || '', // Ensure empty string for offline sessions
        type: s.type
      }))
    };
    
    // Log the actual payload for debugging
    console.log('Payload to be sent:', payload);

    const obs = this.editingId
      ? this.sessionService.updateEvent(this.editingId, payload)
      : this.sessionService.addEvent(payload);

    obs.subscribe({
      next: (response) => {
        console.log('Success response:', response); // For debugging
        this.isSubmitting = false;
        this.message.success(this.editingId ? 'Formation updated successfully!' : 'Formation created successfully!');
        this.loadEvents();
        this.modalForm.reset();
        this.modalRef.close();
      },
      error: err => {
        this.isSubmitting = false;
        console.error('Error saving event:', err);
        this.message.error(
          this.editingId 
            ? `Failed to update formation: ${err.error?.message || err.message || 'Unknown error'}` 
            : `Failed to create formation: ${err.error?.message || err.message || 'Unknown error'}`
        );
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

  // 3. Ajoutez cette méthode pour charger les utilisateurs inscrits
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
  });}
  
}