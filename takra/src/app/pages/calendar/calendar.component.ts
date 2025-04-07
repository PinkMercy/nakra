import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
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

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ReactiveFormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  calendarOptions!: CalendarOptions;
  calendarEvents: EventInput[] = [];
  showModal = false;
  eventForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eventService: SessionService
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      // Removed training type field
      date: ['', Validators.required],
      durationInHours: [0],
      // Main session fields (always visible)
      room: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],
      linkMeet: [''],
      sessionType: ['ONLINE'], // This is for the main session only
      // Additional sessions will be stored in this FormArray
      sessions: this.fb.array([]),
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      dateClick: (info) => {
        this.showModal = true;
        // Patch the main event date field with the clicked date
        this.eventForm.patchValue({ date: info.dateStr });
        // Clear previous additional sessions (if any)
        while (this.sessions.length) {
          this.sessions.removeAt(0);
        }
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      events: this.calendarEvents,
    };
  }

  // Getter to access sessions FormArray
  get sessions(): FormArray {
    return this.eventForm.get('sessions') as FormArray;
  }

  // Add an additional session
  addSession(): void {
    const sessionGroup = this.fb.group({
      room: ['', Validators.required],
      date: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],
      linkMeet: [''],
      type: ['ONLINE'], // For additional sessions, use "type"
    });
    this.sessions.push(sessionGroup);
  }

  // Remove a session by index
  removeSession(index: number): void {
    this.sessions.removeAt(index);
  }

  onSubmit(): void {
    console.log('onSubmit() called');
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      
      // Build payload for the main session from top-level fields
      const mainSession = {
        room: formValue.room,
        date: formValue.date,
        timeStart: formValue.timeStart,
        timeEnd: formValue.timeEnd,
        linkMeet: formValue.linkMeet,
        type: formValue.sessionType, // Main session's type comes from sessionType
      };
  
      // Start with the main session in the sessions array
      const sessionsPayload = [mainSession];
      
      // Append additional sessions from the FormArray (if any)
      if (formValue.sessions && formValue.sessions.length > 0) {
        formValue.sessions.forEach((session: any) => {
          sessionsPayload.push({
            room: session.room,
            date: session.date,
            timeStart: session.timeStart,
            timeEnd: session.timeEnd,
            linkMeet: session.linkMeet,
            type: session.type,
          });
        });
      }
      
      // Build the final payload object for the training
      const payload = {
        title: formValue.title,
        description: formValue.description,
        date: formValue.date,
        durationInHours: formValue.durationInHours,
        sessions: sessionsPayload,
      };
      
      console.log('Payload to send to backend:', payload);
      
      // Send the payload to the backend via the service
      this.eventService.addEvent(payload).subscribe({
        next: (response) => {
          console.log('Event created successfully on backend:', response);
          
          // Next, update the calendar so the events show up.
          let newCalendarEvents: EventInput[] = [];
          sessionsPayload.forEach((session, index) => {
            const eventTitle =
              index === 0 ? payload.title : `${payload.title} (${session.type})`;
            const start = session.date + 'T' + session.timeStart;
            const end = session.date + 'T' + session.timeEnd;
            newCalendarEvents.push({
              title: eventTitle,
              start: start,
              end: end,
              extendedProps: {
                description: payload.description,
                room: session.room,
                linkMeet: session.linkMeet,
                // We no longer include a top-level training type,
                // only session type is used in each session.
                durationInHours: payload.durationInHours,
              },
            });
          });
          
          // Update calendar events and options
          this.calendarEvents = [...this.calendarEvents, ...newCalendarEvents];
          this.calendarOptions = {
            ...this.calendarOptions,
            events: this.calendarEvents,
          };
          
          // Reset the form and close the modal
          this.showModal = false;
          this.eventForm.reset({
            durationInHours: 0,
            sessionType: 'ONLINE',
          });
          // Clear any additional sessions from the FormArray
          while (this.sessions.length) {
            this.sessions.removeAt(0);
          }
        },
        error: (err: any) => {
          console.error('Error creating event on backend:', err);
        }
      });
    }
  }  

  closeModal(): void {
    this.showModal = false;
  }
}
