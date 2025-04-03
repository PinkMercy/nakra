import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['WORKSHOP'], // event type (if needed)
      date: ['', Validators.required],
      duration: [0],
      // Main session fields (always visible)
      room: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],
      linkMeet: [''],
      sessionType: ['ONLINE'], // default session type for main session
      // Additional sessions will be stored in this FormArray
      sessions: this.fb.array([])
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
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.calendarEvents,
    };
  }  

  // Getter to easily access sessions as a FormArray
  get sessions(): FormArray {
    return this.eventForm.get('sessions') as FormArray;
  }

  // Method to add a new session group
  addSession(): void {
    const sessionGroup = this.fb.group({
      room: ['', Validators.required],
      date: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],
      linkMeet: [''],
      type: ['ONLINE'], // default session type
    });
    this.sessions.push(sessionGroup);
  }

  // Optionally, remove a session by index
  removeSession(index: number): void {
    this.sessions.removeAt(index);
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      
      // Build payload for the main session from top-level fields
      const mainSession = {
        room: formValue.room,
        date: formValue.date,
        timeStart: formValue.timeStart,
        timeEnd: formValue.timeEnd,
        linkMeet: formValue.linkMeet,
        type: formValue.sessionType,
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
      
      // Build the final payload object
      const payload = {
        title: formValue.title,
        description: formValue.description,
        type: formValue.type,
        date: formValue.date,
        duration: formValue.duration,
        sessions: sessionsPayload,
      };
      
      console.log('Payload to send to backend:', payload);
      // Here you could send the payload to your backend via an HTTP request.
      
      // Next, update the calendar so the events show up.
      let newCalendarEvents: { title: any; start: string; end: string; extendedProps: { description: any; room: any; linkMeet: any; type: any; duration: any; }; }[] = [];
      // For each session in our payload, create a calendar event
      sessionsPayload.forEach((session, index) => {
        const eventTitle = index === 0 ? payload.title : `${payload.title} (${session.type})`;
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
            type: session.type,
            duration: payload.duration,
          }
        });
      });
      
      // Update calendarEvents and the calendarOptions to display the new events
      this.calendarEvents = [...this.calendarEvents, ...newCalendarEvents];
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.calendarEvents,
      };
      
      // Reset the form and close the modal
      this.showModal = false;
      this.eventForm.reset({
        type: 'WORKSHOP',
        duration: 0,
        sessionType: 'ONLINE'
      });
      // Clear any additional sessions from the FormArray
      while (this.sessions.length) {
        this.sessions.removeAt(0);
      }
    }
  }  

  closeModal(): void {
    this.showModal = false;
  }
}
