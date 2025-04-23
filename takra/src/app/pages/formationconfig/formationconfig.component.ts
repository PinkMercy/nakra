
import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session/session.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ButtonModule } from 'primeng/button';
export interface Session {
  room: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  linkMeet: string;
  type: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: number ;
  sessions: Session[];
}
@Component({
  selector: 'app-formationconfig',
  imports: [NzTableModule,
    NzButtonModule,
    CommonModule, NzIconModule,
    ],
  templateUrl: './formationconfig.component.html',
  styleUrl: './formationconfig.component.scss'
})
export class FormationconfigComponent implements OnInit {
  events: Event[] = [];
  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.sessionService.getEvents().subscribe({
      next: (data) => {
        this.events = data
          .filter((event: any) => typeof event.id === 'number') // make sure id is a number
          .map((event: any) => ({
            id: event.id,
            title: event.title ?? '',
            description: event.description ?? '',
            date: event.date ?? '',
            duration: event.duration ?? event.durationInHours ?? 0, // handle both keys
            sessions: event.sessions ?? []
          })) as Event[]; // tell TypeScript this matches the Event interface
      },
      error: (err) => console.error('Error loading events:', err)
    });
  }
  

  

  onEdit(event: Event): void {
    console.log('Edit event', event);
    // Redirect or open modal for editing
  }

  onAssignTrainer(event: Event): void {
    console.log('Assign trainer to event', event);
    // Trigger trainer assignment logic
  }

  onAdd(): void {
    console.log('Add new formation');
    // Open add form
  }
}
