import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { NzFormModule }  from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CommonModule } from '@angular/common';

// 1) Interface pour les détails de la session
interface SessionDetail {
  room: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  linkMeet: string;
  type: 'ONLINE' | 'OFFLINE';   // adapte si tu as d’autres types
}

// 2) Objet “par défaut” (celui que tu veux afficher au clic)
const DEFAULT_SESSION: SessionDetail = {
  room:      'ROOM_102',
  date:      '2025-03-25',
  timeStart: '13:00:00',
  timeEnd:   '15:00:00',
  linkMeet:  'http://example.com/updated-meeting2',
  type:      'ONLINE'
};
@Component({
  selector: 'app-usercalender',
  imports: [FullCalendarModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    ReactiveFormsModule,CommonModule],
  templateUrl: './usercalender.component.html',
  styleUrl: './usercalender.component.scss'
})
export class UsercalenderComponent implements OnInit{
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  calendarOptions!: CalendarOptions;
  calendarEvents: EventInput[] = [];

  currentSession!: SessionDetail;
  isModalVisible = false;
  isOkLoading   = false;
  eventForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // 1) Construction du formulaire (pas utilisé pour affichage, mais utile si tu veux étendre)
    this.eventForm = this.fb.group({
      title:     ['', Validators.required],
      date:      ['', Validators.required],
      timeStart: ['', Validators.required],
      timeEnd:   ['', Validators.required],
      description: ['']
    });

    // 2) Configuration de FullCalendar
    this.calendarOptions = {
      plugins:      [ dayGridPlugin, interactionPlugin ],
      initialView:  'dayGridMonth',
      headerToolbar:{
        left:   'prev,next today',
        center: 'title',
        right:  'dayGridMonth,timeGridWeek,timeGridDay'
      },
      dateClick: this.onDateClick.bind(this),
      events: this.calendarEvents
    };
  }

  onDateClick(info: any) {
    // Cloner DEFAULT_SESSION et mettre à jour la date cliquée
    this.currentSession = {
      ...DEFAULT_SESSION,
      date: info.dateStr
    };
    this.isModalVisible = true;
  }

  handleOk(): void {
    this.isOkLoading = true;
    // Ici tu pourrais appeler un service pour "s'inscrire"
    setTimeout(() => {
      this.isModalVisible = false;
      this.isOkLoading = false;
    }, 300);
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }
}
