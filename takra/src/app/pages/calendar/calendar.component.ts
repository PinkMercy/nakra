import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import { CommonModule } from '@angular/common';
import { EventInput } from '@fullcalendar/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      date: ['', Validators.required],
      start: [''],
      end: [''],
      location: [''],
      description: [''],
      className: ['bg-primary-subtle']
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin], // Load required plugins
      initialView: 'dayGridMonth',
      dateClick: (info) => {
        console.log('Date clicked: ', info.dateStr);
        this.showModal = true;
        this.eventForm.patchValue({ date: info.dateStr });
        // Add your modal opening logic here
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.calendarEvents
    };
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      const newEvent = {
        title: formValue.title,
        start: formValue.date + (formValue.start ? `T${formValue.start}` : ''),
        end: formValue.date + (formValue.end ? `T${formValue.end}` : ''),
        className: formValue.className,
        extendedProps: {
          location: formValue.location,
          description: formValue.description
        }
      };
// Add the new event to the calendar.
      this.calendarEvents = [...this.calendarEvents, newEvent];
       // Update the calendarOptions.events to refresh the calendar display.
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.calendarEvents
      };
       // Close the modal and reset the form.
      this.showModal = false;
      this.eventForm.reset({ className: 'bg-primary-subtle' });
    }
  }

  closeModal(): void {
    this.showModal = false;
  }
}