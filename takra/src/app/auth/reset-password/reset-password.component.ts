import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-reset-password',
  standalone: true, // Assurez-vous d'utiliser le mode standalone
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    NzButtonModule, 
    NzModalModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService, // Renommé pour clarté
    private modal: NzModalService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    // Récupération du token plus robuste
    this.route.queryParams.subscribe(params => {
      console.log('Paramètres de l\'URL:', params);
      
      this.token = params['token'];
      
      if (!this.token) {
        console.error('Aucun token trouvé dans l\'URL');
        this.modal.error({
          nzTitle: 'Erreur',
          nzContent: 'Lien de réinitialisation de mot de passe invalide.',
          nzOnOk: () => this.router.navigate(['/login'])
        });
      } else {
        console.log('Token récupéré:', this.token);
      }
    });
  }

  // Validation des mots de passe
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    return newPassword && confirmPassword && newPassword.value === confirmPassword.value 
      ? null 
      : { mismatch: true };
  }

  onSubmit() {
    // Validation complète
    if (this.resetPasswordForm.invalid) {
      console.error('Formulaire invalide', this.resetPasswordForm.errors);
      
      // Détails précis sur les erreurs
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        const control = this.resetPasswordForm.get(key);
        if (control?.errors) {
          console.error(`Erreurs pour ${key}:`, control.errors);
        }
      });

      // Message d'erreur spécifique
      if (this.resetPasswordForm.hasError('mismatch')) {
        this.modal.error({
          nzTitle: 'Erreur de validation',
          nzContent: 'Les mots de passe ne correspondent pas.',
        });
      } else {
        this.modal.error({
          nzTitle: 'Erreur de validation',
          nzContent: 'Veuillez vérifier vos entrées.',
        });
      }
      return;
    }

    // Vérification du token
    if (!this.token) {
      this.modal.error({
        nzTitle: 'Erreur',
        nzContent: 'Token de réinitialisation manquant.',
      });
      return;
    }

    const newPassword = this.resetPasswordForm.value.newPassword;
    
    console.log('Tentative de réinitialisation de mot de passe');
    console.log('Token:', this.token);
    console.log('Nouveau mot de passe:', newPassword);

    // Appel du service
    this.authService.resetPassword(this.token, newPassword)
      .subscribe({
        next: (response) => {
          console.log('Réponse de réinitialisation:', response);
          this.modal.success({
            nzTitle: 'Succès',
            nzContent: 'Mot de passe réinitialisé avec succès.',
            nzOnOk: () => this.router.navigate(['/login'])
          });
        },
        error: (err) => {
          console.error('Erreur de réinitialisation:', err);
          this.modal.error({
            nzTitle: 'Erreur',
            nzContent: err.error || 'Échec de la réinitialisation du mot de passe.',
          });
        }
      });
  }
}