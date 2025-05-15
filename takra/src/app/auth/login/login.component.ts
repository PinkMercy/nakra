import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;
  
  constructor(private authService: AuthService, private router: Router,
    private notification: NzNotificationService) {}

    onSubmit() {
      // Simple client-side validation
      if (!this.email || !this.password) {
        this.notification.error('Error', 'Veuillez remplir tous les champs obligatoires.');
        return;
      }
  
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (response) => {
          // Save token and user info to localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          this.notification.success('Success', 'Connecté avec succès!');
          //if user admin redirect to stats page else redirect to user homage caled welcome
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.role === 'ADMIN') {
            this.router.navigate(['/home/stats']);
          } else {
            this.router.navigate(['/home/welcome']);
          }
          

          
        },
        error: () => {
          this.errorMessage = 'Identifiants invalides. Veuillez réessayer.';
          this.notification.error('Error', 'Identifiants invalides. Veuillez réessayer.');
        }
      });
    }

   
}
