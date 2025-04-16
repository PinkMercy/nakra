import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { EventImpl } from '@fullcalendar/core/internal';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ReactiveFormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions!: CalendarOptions;
  calendarEvents: EventInput[] = [];
  showModal = false;
  isEditing = false;
  eventForm!: FormGroup;

  // Constructor: Injects FormBuilder and SessionService for form handling and event operations.
  constructor(
    private fb: FormBuilder,
    private eventService: SessionService
  ) {}

  // ngOnInit: Initializes the form, sets calendar options, and loads events from the backend.
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
      sessions: this.fb.array([])
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      dateClick: (info) => {
        this.showModal = true;
        this.isEditing = false;
        this.eventForm.patchValue({ date: info.dateStr });
        while (this.sessions.length) {
          this.sessions.removeAt(0);
        }
      },
      eventClick: (info) => this.openUpdateModal(info.event),
      events: this.calendarEvents
    };

    this.fetchEvents();
  }

  // fetchEvents: Retrieves events from the backend and updates the calendarEvents array and calendar options.
  fetchEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.calendarEvents = events.flatMap(training =>
          training.sessions.map((session, index) => ({
            id: String(training.id),
            title: index === 0
              ? training.title
              : `${training.title} (${session.type})`,
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
        this.calendarOptions = { ...this.calendarOptions, events: this.calendarEvents };
      },
      error: (err) => console.error('Error fetching events:', err)
    });
  }

  // openUpdateModal: Opens the modal and patches the form with the selected event's data for editing.
  openUpdateModal(event: EventImpl): void {
    this.showModal = true;
    this.isEditing = true;

    const startDate = event.start ? new Date(event.start) : new Date();
    const endDate = event.end ? new Date(event.end) : new Date();

    this.eventForm.patchValue({
      trainingId: event.extendedProps['trainingId'],
      title: event.title,
      description: event.extendedProps['description'],
      date: startDate.toISOString().split('T')[0],
      durationInHours: event.extendedProps['durationInHours'],
      room: event.extendedProps['room'],
      timeStart: startDate.toTimeString().substring(0, 5),
      timeEnd: endDate.toTimeString().substring(0, 5),
      linkMeet: event.extendedProps['linkMeet'],
      sessionType: event.extendedProps['sessionType'] || 'ONLINE'
    });
  }

  // Getter: Returns the FormArray for additional sessions.
  get sessions(): FormArray {
    return this.eventForm.get('sessions') as FormArray;
  }

  // addSessionFromExisting: Adds an existing session to the sessions FormArray.
  addSessionFromExisting(existingSession: any): void {
    const sessionGroup = this.fb.group({
      id: [existingSession.id],
      room: [existingSession.room, Validators.required],
      date: [existingSession.date, Validators.required],
      timeStart: [existingSession.timeStart, Validators.required],
      timeEnd: [existingSession.timeEnd, Validators.required],
      linkMeet: [existingSession.linkMeet],
      type: [existingSession.type || 'ONLINE']
    });
    this.sessions.push(sessionGroup);
  }

  // addSession: Adds a new blank session to the sessions FormArray.
  addSession(): void {
    const sessionGroup = this.fb.group({
      room: ['', Validators.required],
      date: ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],
      linkMeet: [''],
      type: ['ONLINE']
    });
    this.sessions.push(sessionGroup);
  }

  // removeSession: Removes a session from the sessions FormArray by index.
  removeSession(index: number): void {
    this.sessions.removeAt(index);
  }

  // onSubmit: Handles form submission by creating or updating an event based on the editing state.
  onSubmit(): void {
    if (this.eventForm.invalid) return;

    const formValue = this.eventForm.value;
    const mainSession = {
      room: formValue.room,
      date: formValue.date,
      timeStart: formValue.timeStart,
      timeEnd: formValue.timeEnd,
      linkMeet: formValue.linkMeet,
      type: formValue.sessionType
    };

    const sessionsPayload = [mainSession];
    if (formValue.sessions && formValue.sessions.length) {
      formValue.sessions.forEach((session: any) => {
        sessionsPayload.push({
          room: session.room,
          date: session.date,
          timeStart: session.timeStart,
          timeEnd: session.timeEnd,
          linkMeet: session.linkMeet,
          type: session.type
        });
      });
    }

    const payload = {
      title: formValue.title,
      description: formValue.description,
      date: formValue.date,
      durationInHours: formValue.durationInHours,
      sessions: sessionsPayload
    };

    if (this.isEditing && formValue.trainingId) {
      // Update the existing event
      this.eventService.updateEvent(formValue.trainingId, payload).subscribe({
        next: () => {
          this.fetchEventsAndUpdateCalendar();
          this.closeModal();
        },
        error: (err) => console.error('Error updating event:', err)
      });
    } else {
      // Create a new event
      this.eventService.addEvent(payload).subscribe({
        next: () => {
          const newEvents: EventInput[] = sessionsPayload.map((session: any, index: number) => ({
            title: index === 0 ? payload.title : `${payload.title} (${session.type})`,
            start: `${session.date}T${session.timeStart}`,
            end: `${session.date}T${session.timeEnd}`,
            extendedProps: {
              description: payload.description,
              room: session.room,
              linkMeet: session.linkMeet,
              durationInHours: payload.durationInHours
            }
          }));

          this.calendarEvents = [...this.calendarEvents, ...newEvents];
          this.calendarOptions = { ...this.calendarOptions, events: this.calendarEvents };
          this.resetForm();
        },
        error: (err) => console.error('Error creating event:', err)
      });
    }
  }

  // onDelete: Deletes the current event after a confirmation prompt.
  onDelete(): void {
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

  // closeModal: Closes the modal popup.
  closeModal(): void {
    this.showModal = false;
  }

  // resetForm: Resets the event form and clears additional sessions.
  resetForm(): void {
    this.eventForm.reset({
      durationInHours: 0,
      sessionType: 'ONLINE'
    });
    while (this.sessions.length) {
      this.sessions.removeAt(0);
    }
    this.showModal = false;
  }
}
