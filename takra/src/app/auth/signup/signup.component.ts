import { Component,OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private route: Router) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('.+@soprahr\\.com$')
      ]],
      password: ['', Validators.required],
      password_repeat: ['', Validators.required]
    });
  }

  onSubmit() {
    // Vérifier si le formulaire est valide
    if (this.signupForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
      return;
    }

    // Vérifier que les mots de passe correspondent
    const password = this.signupForm.get('password')?.value;
    const password_repeat = this.signupForm.get('password_repeat')?.value;
    if (password !== password_repeat) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    // Réinitialiser le message d'erreur
    this.errorMessage = null;

    // Préparer les données à envoyer
    const { firstname, lastname, email } = this.signupForm.value;
    this.authService.register({
      firstname: firstname || 'User',
      lastname: lastname || '',
      email: email,
      password: password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          firstname: response.firstname,
          lastname: response.lastname,
          email: response.email,
          role: response.role
        }));
        // Rediriger vers la page de login
        this.route.navigate(['/login']);
      },
      error: () => {
        this.errorMessage = 'L\'inscription a échoué. Veuillez réessayer.';
      }
    });
  }

  // Fonction utilitaire pour retourner si un champ est invalide et a été touché
  isFieldInvalid(field: string): boolean {
    const control = this.signupForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
