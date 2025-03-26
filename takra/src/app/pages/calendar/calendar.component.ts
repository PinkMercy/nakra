import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCalendarMode, NzCalendarModule } from 'ng-zorro-antd/calendar';

@Component({
  selector: 'app-calendar',
  imports: [FormsModule, NzCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  date = new Date(2012, 11, 21);
  mode: NzCalendarMode = 'month';

  panelChange(change: { date: Date; mode: string }): void {
    console.log(change.date, change.mode);
  }
}
