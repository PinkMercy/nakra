import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  email = '';
  password = '';
  password_repeat = '';
  firstname = '';
  lastname = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService ,private route: Router) {}

  onSubmit() {
    if (this.password !== this.password_repeat) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService.register({
      firstname: this.firstname || 'User',
      lastname: this.lastname || '',
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          firstname: response.firstname,
          lastname: response.lastname,
          email: response.email,
          role: response.role
        }));
        // Optionally, redirect or show a success message
         this.route.navigate(['/login']); // Uncomment if you have a router
      },
      error: () => {
        this.errorMessage = 'Registration failed. Try again.';
      }
    });
  }
}
