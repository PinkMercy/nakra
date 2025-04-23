import { Component, OnInit , ViewChild} from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { EventImpl } from '@fullcalendar/core/internal';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ReactiveFormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions!: CalendarOptions;
  calendarEvents: EventInput[] = [];
  showModal = false;
  isEditing = false;
  eventForm!: FormGroup;
  trainings: any[] = []; // Added to store original training data

  constructor(
    private fb: FormBuilder,
    private eventService: SessionService
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      trainingId: [null],
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required],
      durationInHours: [0],
      room: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],
      linkMeet: [''],
      sessionType: ['ONLINE'],
      sessions: this.fb.array([]),
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      dateClick: (info) => {
        this.showModal = true;
        this.isEditing = false;
        this.eventForm.patchValue({ date: info.dateStr });
        this.sessions.clear();
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      eventClick: (info) => this.openUpdateModal(info.event),
      events: this.calendarEvents,
    };

    // Fetch and store original trainings
    this.eventService.getEvents().subscribe({
      next: (trainings) => {
        this.trainings = trainings; // Store original data
        this.calendarEvents = trainings.flatMap(training => 
          training.sessions.map((session: any, index: number) => ({
            id: String(training.id),
            title: index === 0 ? training.title : `${training.title} (${session.type})`,
            start: session.date + 'T' + session.timeStart,
            end: session.date + 'T' + session.timeEnd,
            extendedProps: {
              trainingId: training.id,
              description: training.description,
              room: session.room,
              linkMeet: session.linkMeet,
              durationInHours: training.durationInHours,
            },
          }))
        );
        this.calendarOptions = { ...this.calendarOptions, events: this.calendarEvents };
      },
      error: (err) => console.error('Error fetching events:', err)
    });
  }

  openUpdateModal(event: EventImpl): void {
    const trainingId = event.extendedProps['trainingId'] || event.id;
    const training = this.trainings.find(t => t.id === trainingId);
    
    if (training) {
      // Patch main training data
      this.eventForm.patchValue({
        trainingId: training.id,
        title: training.title,
        description: training.description,
        durationInHours: training.durationInHours,
      });

      // Clear existing sessions
      this.sessions.clear();

      // Add all sessions to the form
      training.sessions.forEach((session: { room: string; date: string; timeStart: string; timeEnd: string; linkMeet?: string; type?: string }, index: number) => {
        if (index === 0) {
          // Main session fields
          this.eventForm.patchValue({
            date: session.date,
            room: session.room,
            timeStart: session.timeStart,
            timeEnd: session.timeEnd,
            linkMeet: session.linkMeet,
            sessionType: session.type || 'ONLINE'
          });
        } else {
          // Additional sessions
          this.sessions.push(this.fb.group({
            room: [session.room, Validators.required],
            date: [session.date, Validators.required],
            timeStart: [session.timeStart, Validators.required],
            timeEnd: [session.timeEnd, Validators.required],
            linkMeet: [session.linkMeet],
            type: [session.type || 'ONLINE']
          }));
        }
      });

      this.showModal = true;
      this.isEditing = true;
    }
  }

  // Rest of the component code remains the same...
  
  get sessions(): FormArray {
    return this.eventForm.get('sessions') as FormArray;
  }

  addSession(): void {
    const sessionGroup = this.fb.group({
      room: ['', Validators.required],
      date: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],
      linkMeet: [''],
      type: ['ONLINE'],
    });
    this.sessions.push(sessionGroup);
  }

  removeSession(index: number): void {
    this.sessions.removeAt(index);
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      const mainSession = {
        room: formValue.room,
        date: formValue.date,
        timeStart: formValue.timeStart,
        timeEnd: formValue.timeEnd,
        linkMeet: formValue.linkMeet,
        type: formValue.sessionType,
      };
      const sessionsPayload = [mainSession, ...formValue.sessions];
      const payload = {
        title: formValue.title,
        description: formValue.description,
        date: formValue.date,
        durationInHours: formValue.durationInHours,
        sessions: sessionsPayload,
      };

      if (this.isEditing && formValue.trainingId) {
        this.eventService.updateEvent(formValue.trainingId, payload).subscribe({
          next: () => {
            this.eventService.getEvents().subscribe({
              next: (events) => {
                this.trainings = events;
                this.calendarEvents = this.buildCalendarEvents(events);
                this.calendarOptions.events = this.calendarEvents;
                this.closeModal();
              }
            });
          }
        });
      } else {
        this.eventService.addEvent(payload).subscribe({
          next: (response) => {
            const newTraining = { ...payload, id: response.id };
            this.trainings.push(newTraining);
            this.calendarEvents = this.buildCalendarEvents(this.trainings);
            this.calendarOptions.events = this.calendarEvents;
            this.closeModal();
          }
        });
      }
    }
  }
  onDelete(): void {
    // Add logic to delete the event
    const trainingId = this.eventForm.value.trainingId;
    if (trainingId && confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(trainingId).subscribe({
        next: () => {
          this.fetchEventsAndUpdateCalendar();
          this.closeModal();
        },
        error: (err) => console.error('Error deleting event:', err)
      });
    }
    console.log('Event deleted');
  }
  // fetchEventsAndUpdateCalendar: Refreshes events from the backend and updates the FullCalendar view.
  fetchEventsAndUpdateCalendar(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.calendarEvents = events.flatMap(training =>
          training.sessions.map((session, index) => ({
            id: String(training.id),
            title: index === 0 ? training.title : `${training.title} (${session.type})`,
            start: `${session.date}T${session.timeStart}`,
            end: `${session.date}T${session.timeEnd}`,
            extendedProps: {
              trainingId: training.id,
              description: training.description,
              room: session.room,
              linkMeet: session.linkMeet,
              durationInHours: training.durationInHours,
              sessionType: session.type
            }
          }))
        );
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.removeAllEvents();
        this.calendarEvents.forEach((event) => calendarApi.addEvent(event));
      },
      error: (err) => console.error('Error re-fetching events:', err)
    });
  }
  private buildCalendarEvents(trainings: any[]): EventInput[] {
    return trainings.flatMap(training => 
      training.sessions.map((session: { room: string; date: string; timeStart: string; timeEnd: string; linkMeet?: string; type?: string }, index: number) => ({
        id: String(training.id),
        title: index === 0 ? training.title : `${training.title} (${session.type})`,
        start: session.date + 'T' + session.timeStart,
        end: session.date + 'T' + session.timeEnd,
        extendedProps: {
          trainingId: training.id,
          description: training.description,
          room: session.room,
          linkMeet: session.linkMeet,
          durationInHours: training.durationInHours,
        },
      }))
    );
  }

  closeModal(): void {
    this.showModal = false;
    this.eventForm.reset();
    this.sessions.clear();
  }

  // Delete and closeModal methods remain the same...
  
}