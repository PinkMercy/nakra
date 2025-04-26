import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, EventClickArg,EventInput } from '@fullcalendar/core';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { NzFormModule }  from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session/session.service';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
interface FormationPreview {
  title: string;
  description: string;
  type: string;
  date: string;
  formateurEmail: string;
  durationInHours: number;
}
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

   // will hold just the six fields
   currentFormation!: FormationPreview;
   isModalVisible = false;
  

  constructor(private fb: FormBuilder,private sessionService: SessionService,
    private router: Router,
    private modal: NzModalService) {}

  ngOnInit(): void {
    // build the calendar options
    this.calendarOptions = {
      plugins: [ dayGridPlugin, interactionPlugin ],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.calendarEvents,
      eventClick: this.onEventClick.bind(this)
    };

    // fetch your trainings
    this.sessionService.getEvents().subscribe((trainings) => {
      this.calendarEvents = trainings.map(t => ({
        id: t.id?.toString(),        // optional, if you have an ID
        title: t.title,
        start: t.date,
        extendedProps: { ...t }      // stash the full JSON in extendedProps
      }));
      // re-assign so FullCalendar picks them up
      this.calendarOptions = { ...this.calendarOptions, events: this.calendarEvents };
    });
  }

  onEventClick(clickInfo: EventClickArg) {
    //display in console the props
    console.log(clickInfo.event.extendedProps);
    
    const props = clickInfo.event.extendedProps as any;
  
    // create the modal on the fly
    const m = this.modal.create({
      nzTitle: 'Détails de la formation',
      nzClosable: true,
      // simple HTML string for the body
      nzContent: `
        <p><strong>Titre :</strong> ${props.title}</p>
        <p><strong>Description :</strong> ${props.description}</p>
        <p><strong>Type :</strong> ${props.type}</p>
        <p><strong>Date :</strong> ${props.date}</p>
        <p><strong>Formateur :</strong> ${props.formateur?.firstname } ${props.formateur?.lastname}</p>
        <p><strong>Durée (heures) :</strong> ${props.durationInHours}</p>
      `,
      nzFooter: [
        {
          label: 'Annuler',
          onClick: () => m.destroy()
        },
        {
          label: 'Détails formation',
          type: 'primary',
          onClick: () => {
            m.destroy();
            // assume you stored an `id` in extendedProps
            const id = (props as any).id;
            this.router.navigate(['detailformation', id]);
          }
        }
      ]
    });
  }
  

  // Cancel button
  handleCancel(): void {
    this.isModalVisible = false;
  }

  // When user clicks “Détails formation”
  goToDetailFormation(): void {
    // assuming you have a route like /detailformation/:id
    // grab the id from extendedProps if you stored it (make sure you did above)
    const routeId = (this.calendarComponent
      .getApi()
      .getEventById(this.currentFormation.title)  // or store id separately
      ?.extendedProps as any).id;
    this.isModalVisible = false;
    this.router.navigate(['/detailformation', routeId]);
  }
}
