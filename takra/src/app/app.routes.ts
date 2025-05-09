import { Routes } from '@angular/router';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AdminusersComponent } from './pages/adminusers/adminusers.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { authGuard } from './auth/gard/auth.guard';
import { adminGuard } from './auth/gard/admin.guard';
import { UsercalenderComponent } from './pages/usercalender/usercalender.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormationconfigComponent } from './pages/formationconfig/formationconfig.component';
import { DetailformationComponent } from './pages/detailformation/detailformation.component';
import { ErrorpageComponent } from './pages/errorpage/errorpage.component';
import { RoomadminComponent } from './pages/roomadmin/roomadmin.component';
import { StatsComponent } from './pages/stats/stats.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent }, 
  {path: 'signup', component: SignupComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  { path: 'home', component: SidebarComponent,canActivate: [authGuard], children: [
    { path: 'calendar', component: CalendarComponent , canActivate: [adminGuard]}, 
    { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
    {path: 'AdminUsersControle',component:AdminusersComponent, canActivate: [adminGuard],},
    {path: 'gformation',component:FormationconfigComponent, canActivate: [adminGuard],},
    {path: 'adminsalle',component:RoomadminComponent, canActivate: [adminGuard],},
    {path: 'stats',component:StatsComponent, canActivate: [adminGuard],},
    {path: 'usercalendar', component: UsercalenderComponent },
    {path: 'profile', component:ProfileComponent },
    {path: 'detailformation/:id', component: DetailformationComponent },

  ]},
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  {path: 'errorpage',component:ErrorpageComponent} // Wildcard route for a 404 page
];
