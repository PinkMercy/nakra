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
  isEditing = false; // flag to track the mode (create/update)
  eventForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private eventService: SessionService
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      trainingId: [null],  // hidden control to store the training ID for updates
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
        this.isEditing = false; // Reset flag for create mode
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
      eventClick: (info) => {
        this.openUpdateModal(info.event);
      },
      events: this.calendarEvents,
    };
  
    // Fetch events from the backend
    this.eventService.getEvents().subscribe({
      next: (events) => {
        // Transform each training into calendar events.
        // Assuming each Event (training) has a sessions array.
        this.calendarEvents = events.flatMap((training) =>
          training.sessions.map((session, index) => {
            const eventTitle = index === 0 ? training.title : `${training.title} (${session.type})`;
            return {
              id: String(training.id),
              title: eventTitle,
              start: session.date + 'T' + session.timeStart,
              end: session.date + 'T' + session.timeEnd,
              extendedProps: {
                trainingId: training.id,
                description: training.description,
                room: session.room,
                linkMeet: session.linkMeet,
                durationInHours: training.durationInHours,
              },
            };
          })
        );
        // Update the calendar options with the fetched events
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.calendarEvents,
        };
      },
      error: (err) => {
        console.error('Error fetching events:', err);
      }
    });
  }
  openUpdateModal(event: EventImpl): void {
    console.log('Opening update modal for event:', event);
  
    // Show the modal for editing/updating the event
    this.showModal = true;
    this.isEditing = true; // Switch to update mode
  
    // Extract the start and end dates as Date objects
    const startDate = event.start ? new Date(event.start) : new Date();
    const endDate = event.end ? new Date(event.end) : new Date();
  
  // Ensure trainingId is set: try event.extendedProps['trainingId'] first, and fallback to event.id if needed.
  const trainingId = event.extendedProps['trainingId'] || event.id;


    // Patch the form with the event data
    // Adjust the formatting as needed to suit your application.
    this.eventForm.patchValue({
      trainingId: event.extendedProps['trainingId'], // assuming trainingId is stored here
      title: event.title,
      description: event.extendedProps['description'],
      // Format the date as YYYY-MM-DD if needed
      date: startDate.toISOString().split('T')[0],
      durationInHours: event.extendedProps['durationInHours'],
      // These fields come from the main session info
      room: event.extendedProps['room'],
      // Format time as HH:mm (substring takes the first 5 characters)
      timeStart: startDate.toTimeString().substring(0, 5),
      timeEnd: endDate.toTimeString().substring(0, 5),
      linkMeet: event.extendedProps['linkMeet'],
      // Use sessionType if available; default to "ONLINE" otherwise
      sessionType: event.extendedProps['sessionType'] || 'ONLINE'
    });
  
    // If you also have additional session details in the event and want to patch those
    // into your sessions FormArray, you can do it here.
    // For example:
    // this.sessions.clear();
    // if (event.extendedProps.additionalSessions) {
    //   event.extendedProps.additionalSessions.forEach((sess: any) => {
    //     const sessionGroup = this.fb.group({
    //       room: [sess.room, Validators.required],
    //       date: [sess.date, Validators.required],
    //       timeStart: [sess.timeStart, Validators.required],
    //       timeEnd: [sess.timeEnd, Validators.required],
    //       linkMeet: [sess.linkMeet],
    //       type: [sess.type || 'ONLINE']
    //     });
    //     this.sessions.push(sessionGroup);
    //   });
    // }
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
      console.log('Form Value:', formValue); // Check trainingId here
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
  
      if (this.isEditing && formValue.trainingId) {
        // Update branch
        this.eventService.updateEvent(formValue.trainingId, payload).subscribe({
          next: (response) => {
            console.log('Event updated successfully on backend:', response);
            // Re-fetch the updated events from the backend
            this.eventService.getEvents().subscribe({
              next: (events) => {
                // Rebuild your local events array using the same logic as in ngOnInit
                this.calendarEvents = events.flatMap((training) =>
                  training.sessions.map((session, index) => {
                    const eventTitle = index === 0 ? training.title : `${training.title} (${session.type})`;
                    return {
                      id: String(training.id),
                      title: eventTitle,
                      start: session.date + 'T' + session.timeStart,
                      end: session.date + 'T' + session.timeEnd,
                      extendedProps: {
                        trainingId: training.id,
                        description: training.description,
                        room: session.room,
                        linkMeet: session.linkMeet,
                        durationInHours: training.durationInHours,
                      },
                    };
                  })
                );
  
                // Use the FullCalendar API to remove and re-add events
                const calendarApi = this.calendarComponent.getApi();
                calendarApi.removeAllEvents();
                this.calendarEvents.forEach((event) => calendarApi.addEvent(event));
              },
              error: (err) => {
                console.error('Error re-fetching events:', err);
              }
            });
            this.closeModal();
          },
          error: (err: any) => {
            console.error('Error updating event on backend:', err);
          }
        });
      } else {
        // Create branch (unchanged)
        this.eventService.addEvent(payload).subscribe({
          next: (response) => {
            console.log('Event created successfully on backend:', response);
            
            // Create new events manually from sessionsPayload
            let newCalendarEvents: EventInput[] = [];
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
                  durationInHours: payload.durationInHours,
                },
              });
            });
            
            this.calendarEvents = [...this.calendarEvents, ...newCalendarEvents];
            this.calendarOptions = {
              ...this.calendarOptions,
              events: this.calendarEvents,
            };
            
            this.showModal = false;
            this.eventForm.reset({
              durationInHours: 0,
              sessionType: 'ONLINE',
            });
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
  }
  onDelete(): void {
    // Ensure there is a training id
    const trainingId = this.eventForm.value.trainingId;
    if (trainingId && confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(trainingId).subscribe({
        next: (response) => {
          console.log('Event deleted successfully on backend:', response);
          // After deletion, re-fetch the events from the backend
          this.eventService.getEvents().subscribe({
            next: (events) => {
              // Rebuild your calendarEvents array
              this.calendarEvents = events.flatMap((training) =>
                training.sessions.map((session, index) => {
                  const eventTitle =
                    index === 0 ? training.title : `${training.title} (${session.type})`;
                  return {
                    id: String(training.id),
                    title: eventTitle,
                    start: session.date + 'T' + session.timeStart,
                    end: session.date + 'T' + session.timeEnd,
                    extendedProps: {
                      trainingId: training.id,
                      description: training.description,
                      room: session.room,
                      linkMeet: session.linkMeet,
                      durationInHours: training.durationInHours,
                    },
                  };
                })
              );
              // Use FullCalendar API to update the view: remove all events and add the updated ones.
              const calendarApi = this.calendarComponent.getApi();
              calendarApi.removeAllEvents();
              this.calendarEvents.forEach((evt) => calendarApi.addEvent(evt));
              this.closeModal();
            },
            error: (err) => {
              console.error('Error re-fetching events after deletion:', err);
            },
          });
        },
        error: (err: any) => {
          console.error('Error deleting event on backend:', err);
        },
      });
    }
  }
  

  closeModal(): void {
    this.showModal = false;
  }
  
}

