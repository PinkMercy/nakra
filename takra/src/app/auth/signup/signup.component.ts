import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule],
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
        this.emailDomainValidator
      ]],
      password: ['', [
        Validators.required,
        this.strongPasswordValidator
      ]],
      password_repeat: ['', Validators.required]
    });
  }

  // Validateur personnalisé pour le domaine email
  emailDomainValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Ne pas valider si le champ est vide (géré par Validators.required)
    }
    
    const email = control.value as string;
    if (email && !email.endsWith('@soprahr.com')) {
      return { invalidDomain: true };
    }
    
    return null;
  }

  // Validateur personnalisé pour mot de passe fort
  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Ne pas valider si le champ est vide (géré par Validators.required)
    }

    const password = control.value as string;
    const errors: ValidationErrors = {};

    // Au moins 8 caractères
    if (password.length < 8) {
      errors['minLength'] = true;
    }

    // Au moins une lettre minuscule
    if (!/[a-z]/.test(password)) {
      errors['lowercase'] = true;
    }

    // Au moins une lettre majuscule
    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }

    // Au moins un chiffre
    if (!/[0-9]/.test(password)) {
      errors['number'] = true;
    }

    // Au moins un caractère spécial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  onSubmit() {
    // Vérifier si le formulaire est valide
    if (this.signupForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
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

  // Fonction utilitaire pour obtenir les erreurs spécifiques d'un champ
  getFieldErrors(field: string): ValidationErrors | null {
    const control = this.signupForm.get(field);
    return control?.errors || null;
  }
}