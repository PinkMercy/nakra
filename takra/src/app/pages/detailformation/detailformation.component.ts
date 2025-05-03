import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session/session.service';

interface Formation {
  id: number;
  title: string;
  description: string;
  date: string;
  durationInHours?: number;
  formateur: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  sessions: Session[];
}

interface Session {
  id: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  type: 'ONLINE' | 'INPERSON';
  room:any;
  meetingLink?: string;
}

@Component({
  selector: 'app-detailformation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detailformation.component.html',
  styleUrl: './detailformation.component.scss'
})
export class DetailformationComponent implements OnInit {
  formation: Formation | null = null;
  isLoading = true;
  error: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    // Get the formation ID from the route parameters
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadFormationDetails(id);
        

      } else {
        this.error = 'Formation ID not found';
        this.isLoading = false;
      }
    });
  }

  loadFormationDetails(id: number): void {
    this.isLoading = true;
    this.sessionService.getTrainingById(id).subscribe({
      next: (data) => {
        this.formation = data;
        console.log('Formation details loaded', this.formation);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading formation details', err);
        this.error = 'Failed to load formation details';
        this.isLoading = false;
      }
    });
  }

  addToCalendar(session: Session): void {
    // Implementation for adding to calendar
    alert('Calendar event creation would be implemented here.');
  }

  formatTime(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  getFormatterInitials(formateur: { firstname: string, lastname: string }): string {
    return `${formateur.firstname.charAt(0)}${formateur.lastname.charAt(0)}`;
  }
}