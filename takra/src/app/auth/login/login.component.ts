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
        this.notification.error('Error', 'Please fill in all required fields.');
        return;
      }
  
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (response) => {
          // Save token and user info to localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));
          this.notification.success('Success', 'Logged in successfully!');
          this.router.navigate(['/']); // Redirect after login

          
        },
        error: () => {
          this.errorMessage = 'Invalid credentials. Please try again.';
          this.notification.error('Error', 'Invalid credentials. Please try again.');
        }
      });
    }

   
}
