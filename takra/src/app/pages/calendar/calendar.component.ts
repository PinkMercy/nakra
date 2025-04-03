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
  FormArray
} from '@angular/forms';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ReactiveFormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
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
      type: ['WORKSHOP'], // default type
      date: ['', Validators.required],
      duration: [0],
      sessions: this.fb.array([]) // FormArray for sessions
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      dateClick: (info) => {
        this.showModal = true;
        // Patch the date field for the event
        this.eventForm.patchValue({ date: info.dateStr });
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.calendarEvents
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
      type: ['ONLINE'] // default session type
    });
    this.sessions.push(sessionGroup);
  }

  // Optionally, remove a session by index
  removeSession(index: number): void {
    this.sessions.removeAt(index);
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      // Here, you can transform the form value to your desired event structure.
      const formValue = this.eventForm.value;
      const newEvent = {
        title: formValue.title,
        description: formValue.description,
        type: formValue.type,
        date: formValue.date,
        duration: formValue.duration,
        sessions: formValue.sessions
      };

      console.log('Event to add:', newEvent);

      // Optionally add the event to the calendar events (this example uses only title and start/end)
      // You might want to handle calendar event properties differently if they need to reflect sessions, etc.
      this.calendarEvents = [...this.calendarEvents, {
        title: newEvent.title,
        start: newEvent.date,
        extendedProps: { description: newEvent.description }
      }];

      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.calendarEvents
      };

      // Close the modal and reset the form
      this.showModal = false;
      this.eventForm.reset({ type: 'WORKSHOP', duration: 0 });
      // Clear all sessions
      while (this.sessions.length) {
        this.sessions.removeAt(0);
      }
    }
  }

  closeModal(): void {
    this.showModal = false;
  }
}
