import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Event, Session } from '../../models/session';

interface FormationPreview {
  title: string;
  description: string;
  type: string;
  date: string;
  formateurEmail: string;
  durationInHours: number;
}

@Component({
  selector: 'app-usercalender',
  imports: [
    FullCalendarModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './usercalender.component.html',
  styleUrl: './usercalender.component.scss'
})
export class UsercalenderComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  private lastClickedTrainingId!: number;
  private lastClickedSessionId!: number;
  calendarOptions!: CalendarOptions;
  calendarEvents: EventInput[] = [];
  trainings: Event[] = [];

  // will hold just the six fields
  currentFormation!: FormationPreview;
  isModalVisible = false;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private router: Router,
    private modal: NzModalService
  ) {}
  
  // Method to determine color based on session type
  getEventColor(type: string): string {
    // Default colors for different session types
    switch (type.toUpperCase()) {
      case 'ONLINE':
        return '#4285F4'; // Google blue
      case 'OFFLINE':
        return '#34A853'; // Google green
      case 'HYBRID':
        return '#FBBC05'; // Google yellow
      case 'WEBINAR':
        return '#EA4335'; // Google red
      case 'WORKSHOP':
        return '#9C27B0'; // Purple
      case 'CERTIFICATION':
        return '#FF9800'; // Orange
      default:
        return '#607D8B'; // Blue gray for unknown types
    }
  }

  ngOnInit(): void {
    // build the calendar options
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.calendarEvents,
      eventClick: this.onEventClick.bind(this),
      eventDisplay: 'block', // Use 'block' instead of dots
      displayEventTime: false, // Hide the event time in month view
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    };

    // fetch your trainings
    this.sessionService.getEvents().subscribe((trainings) => {
      this.trainings = trainings; // Store all trainings
      
      // Create an event for each session in each training
      this.calendarEvents = [];
      
      trainings.forEach(training => {
        // If training has sessions, create an event for each session
        if (training.sessions && training.sessions.length > 0) {
          training.sessions.forEach(session => {
            const sessionType = session.type || training.type || '';
            
            // Create event for each session with color based on type
            this.calendarEvents.push({
              id: `${training.id}-${session.id}`, // Composite ID to identify both training and session
              title: training.title,
              start: `${session.date}T${session.timeStart}`,
              end: `${session.date}T${session.timeEnd}`,
              backgroundColor: this.getEventColor(sessionType),
              borderColor: this.getEventColor(sessionType),
              textColor: '#ffffff',
              extendedProps: {
                trainingId: training.id,
                sessionId: session.id,
                description: training.description,
                type: sessionType,
                durationInHours: training.durationInHours,
                formateur: training.formateur, // Assuming this comes with the training
                room: session.room,
                linkMeet: session.linkMeet
              }
            });
          });
        } else {
          // Fallback for trainings without sessions - use the main date
          const trainingType = training.type || '';
          this.calendarEvents.push({
            id: training.id?.toString(),
            title: training.title,
            start: training.date,
            backgroundColor: this.getEventColor(trainingType),
            borderColor: this.getEventColor(trainingType),
            textColor: '#ffffff',
            extendedProps: { 
              trainingId: training.id,
              description: training.description,
              type: trainingType,
              durationInHours: training.durationInHours,
              formateur: training.formateur
            }
          });
        }
      });

      // re-assign so FullCalendar picks them up
      this.calendarOptions = { ...this.calendarOptions, events: this.calendarEvents };
    });
  }

  onEventClick(clickInfo: EventClickArg) {
    const props = clickInfo.event.extendedProps as any;
    
    // Parse the composite ID if it exists
    const idParts = clickInfo.event.id.split('-');
    this.lastClickedTrainingId = parseInt(idParts[0]);
    
    if (idParts.length > 1) {
      this.lastClickedSessionId = parseInt(idParts[1]);
    }
    
    console.log("Training ID:", this.lastClickedTrainingId);
    console.log("Session ID:", this.lastClickedSessionId);

    // Create modal with session-specific information
    const m = this.modal.create({
      nzTitle: 'Détails de la formation',
      nzClosable: true,
      nzContent: `
        <p><strong>Titre :</strong> ${clickInfo.event.title}</p>
        <p><strong>Type :</strong> ${props.type}</p>
        <p><strong>Date :</strong> ${clickInfo.event.start?.toLocaleDateString()}</p>
        ${props.formateur ? `<p><strong>Formateur :</strong> ${props.formateur.firstname} ${props.formateur.lastname}</p>` : ''}
        <p><strong>Durée (heures) :</strong> ${props.durationInHours}</p>
      `,
      nzFooter: [
        { label: 'Annuler', onClick: () => m.destroy() },
        {
          label: 'Détails formation',
          type: 'primary',
          onClick: () => {
            m.destroy();
            this.goToDetailFormation();
          }
        }
      ]
    });
  }

  // Cancel button
  handleCancel(): void {
    this.isModalVisible = false;
  }

  goToDetailFormation(): void {
    this.sessionService.getTrainingById(this.lastClickedTrainingId)
      .subscribe({
        next: training => {
          console.log('Full training detailsaaaaaaaaaaaaaaa:', training);
          // now navigate with the full object's ID
          this.router.navigate(['home/detailformation', training.id]);
        },
        error: err => {
          console.error('Error loading training details', err);
        }
      });
  }
}