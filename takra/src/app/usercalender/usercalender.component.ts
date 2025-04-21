import { Component, OnInit , ViewChild} from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { EventImpl } from '@fullcalendar/core/internal';
import { ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-usercalender',
  imports: [ReactiveFormsModule,
    FullCalendarModule,
    CommonModule,
    ],
  templateUrl: './usercalender.component.html',
  styleUrl: './usercalender.component.scss'
})
export class UsercalenderComponent {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions!: CalendarOptions;

}
