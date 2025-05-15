import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import {
  DashboardOutline,
  UserOutline,
  CalendarOutline,
  TeamOutline,
  BookOutline,
  HomeOutline,
  LogoutOutline
} from '@ant-design/icons-angular/icons';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    FullCalendarModule
  ],
  providers: [
    // On fournit ici les icônes qu’on utilisera dans le template
    { provide: NZ_ICONS, useValue: [
        DashboardOutline,
        UserOutline,
        CalendarOutline,
        TeamOutline,
        BookOutline,
        HomeOutline,
        LogoutOutline
      ] 
    }
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  role: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.role = user?.role || null;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
