import { Routes } from '@angular/router';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AdminusersComponent } from './pages/adminusers/adminusers.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', component: SidebarComponent, children: [
    { path: 'calendar', component: CalendarComponent }, 
    { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  {path: 'AdminUsersControle',component:AdminusersComponent}
  ]},
  { path: 'login', component: LoginComponent }, 
  {path: 'signup', component: SignupComponent},
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) }
];
