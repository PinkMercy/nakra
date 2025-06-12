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
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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
    FullCalendarModule,
    NzDropDownModule, // Ajout pour le menu déroulant
    NzAvatarModule    // Ajout pour l'avatar
  ],
  providers: [
    {
      provide: NZ_ICONS,
      useValue: [
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
  userRole: string | null = null;  // Rôle réel de l'utilisateur
  activeRole: string | null = null; // Rôle actif choisi

  constructor(private router: Router,private authService: AuthService,) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userRole = user?.role || null;
    this.activeRole = localStorage.getItem('activeRole') || this.userRole;
  }

  // Méthode pour changer le rôle actif
  setActiveRole(role: string): void {
    this.activeRole = role;
    localStorage.setItem('activeRole', role);
  }

  logout(): void {
  this.authService.logout().subscribe({
    next: (response) => {
      console.log('Déconnexion réussie:', response);
      // Rediriger vers la page de connexion
      this.router.navigate(['/login']);
    },
    error: (error) => {
      console.error('Erreur lors de la déconnexion:', error);
      // Même si la déconnexion échoue côté serveur, on nettoie le localStorage
      this.authService.clearLocalStorage();
      // Rediriger quand même vers la page de connexion
      this.router.navigate(['/login']);
    }
  });}
}