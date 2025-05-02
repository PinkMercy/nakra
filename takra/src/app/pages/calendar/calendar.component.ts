import { Component, OnInit , ViewChild} from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
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
import { RoomService } from '../../services/room.service';

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
  rooms: any[] = []; // Added to store room data

  constructor(
    private fb: FormBuilder,
    private eventService: SessionService,
    private sessionRooms: RoomService
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      trainingId: [null],
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required],
      durationInHours: [0],
      formateurEmail: ['', [Validators.required, Validators.email]],
      roomId: [null, Validators.required],
      timeStart: ['', Validators.required],
      timeEnd: ['', Validators.required],
      linkMeet: [''],
      sessionType: ['ONLINE'],
      sessions: this.fb.array([]),
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
      initialView: 'dayGridMonth',
      dateClick: (info) => this.dateClick(info), // Use our improved method
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      eventClick: (info) => this.openUpdateModal(info.event), // Use our improved method
      events: this.calendarEvents,
      height: 'auto', // Adjust height automatically
      // Add these new options for better interaction
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false,
        hour12: false
      },
      eventDisplay: 'block', // Better display for events
      nowIndicator: true, // Shows a marker for current time
      eventInteractive: true, // Ensures events are clickable
      selectable: true, // Allow selecting date ranges
      selectMirror: true, // Shows a placeholder when selecting dates
      dayMaxEvents: true, // When too many events, show "+more" link
    };

    // Fetch rooms
    this.fetchRooms();

    // Fetch and store original trainings
    this.fetchEventsAndUpdateCalendar();
  }

  fetchRooms(): void {
    // Assuming there's a method in the service to get rooms
    this.sessionRooms.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
      },
      error: (err) => console.error('Error fetching rooms:', err)
    });
  }
  openModal(): void {
    this.showModal = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    setTimeout(() => {
      // Focus on the first input element after modal is rendered
      const firstInput = document.querySelector('.modal-content input') as HTMLElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }
  onBackdropClick(event: MouseEvent): void {
    // Only close if clicking directly on the backdrop, not on modal content
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
  closeModal(): void {
    this.showModal = false;
    document.body.style.overflow = ''; // Restore scrolling
    this.eventForm.reset();
    this.sessions.clear();
  }
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
  dateClick(info: any): void {
    this.isEditing = false;
    this.eventForm.reset(); // Ensure form is fully reset
    this.sessions.clear();
    this.eventForm.patchValue({ date: info.dateStr });
    this.openModal();
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
        formateurEmail: training.formateurEmail || '',
      });

      // Clear existing sessions
      this.sessions.clear();

      // Add all sessions to the form
      training.sessions.forEach((session: { roomId: number; date: string; timeStart: string; timeEnd: string; linkMeet?: string; type?: string }, index: number) => {
        if (index === 0) {
          // Main session fields
          this.eventForm.patchValue({
            date: session.date,
            roomId: session.roomId,
            timeStart: session.timeStart,
            timeEnd: session.timeEnd,
            linkMeet: session.linkMeet || '',
            sessionType: session.type || 'ONLINE'
          });
        } else {
          // Additional sessions
          this.sessions.push(this.fb.group({
            roomId: [session.roomId, Validators.required],
            date: [session.date, Validators.required],
            timeStart: [session.timeStart, Validators.required],
            timeEnd: [session.timeEnd, Validators.required],
            linkMeet: [session.linkMeet || ''],
            type: [session.type || 'ONLINE']
          }));
        }
      });

      this.showModal = true;
      this.isEditing = true;
    }
  }
  
  get sessions(): FormArray {
    return this.eventForm.get('sessions') as FormArray;
  }

  addSession(): void {
    const sessionGroup = this.fb.group({
      roomId: [null, Validators.required],
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
        roomId: formValue.roomId,
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
        formateurEmail: formValue.formateurEmail,
        sessions: sessionsPayload,
      };

      if (this.isEditing && formValue.trainingId) {
        this.eventService.updateEvent(formValue.trainingId, payload).subscribe({
          next: () => {
            this.fetchEventsAndUpdateCalendar();
            this.closeModal();
          },
          error: (err) => console.error('Error updating event:', err)
        });
      } else {
        this.eventService.addEvent(payload).subscribe({
          next: (response) => {
            console.log('Event created:', response);
            this.fetchEventsAndUpdateCalendar();
            this.closeModal();
          },
          error: (err) => console.error('Error creating event:', err)
        });
      }
    }
  }

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

  fetchEventsAndUpdateCalendar(): void {
    this.eventService.getEvents().subscribe({
      next: (trainings) => {
        this.trainings = trainings; // Store original data
        this.calendarEvents = this.buildCalendarEvents(trainings);
        
        if (this.calendarComponent) {
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.removeAllEvents();
          this.calendarEvents.forEach((event) => calendarApi.addEvent(event));
        } else {
          this.calendarOptions = { ...this.calendarOptions, events: this.calendarEvents };
        }
      },
      error: (err) => console.error('Error fetching events:', err)
    });
  }

  private buildCalendarEvents(trainings: any[]): EventInput[] {
    return trainings.flatMap(training => 
      training.sessions.map((session: { roomId: number; date: string; timeStart: string; timeEnd: string; linkMeet?: string; type?: string }, index: number) => {
        // Find room name from roomId
        const room = this.rooms.find(r => r.id === session.roomId);
        const roomName = room ? room.name : `Room ID: ${session.roomId}`;
        
        return {
          id: String(training.id),
          title: index === 0 ? training.title : `${training.title} (${session.type})`,
          start: session.date + 'T' + session.timeStart,
          end: session.date + 'T' + session.timeEnd,
          extendedProps: {
            trainingId: training.id,
            description: training.description,
            roomId: session.roomId,
            roomName: roomName,
            linkMeet: session.linkMeet,
            durationInHours: training.durationInHours,
            formateurEmail: training.formateurEmail,
            sessionType: session.type
          },
        };
      })
    );
  }

  

  getRoomName(roomId: number): string {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.name : `Room ID: ${roomId}`;
  }
}