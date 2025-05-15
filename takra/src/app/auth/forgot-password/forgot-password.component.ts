// src/app/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzButtonModule,
    NzModalModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  message: string | null = null;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private passwordResetService: AuthService,
    private modal: NzModalService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.error = 'Veuillez saisir une adresse e‑mail valide.';
      return;
    }

    const email = this.forgotPasswordForm.value.email;
    const appUrl = 'http://localhost:4200'; // ou depuis environment

    this.passwordResetService.requestReset(email, appUrl).subscribe({
      next: () => this.showSuccessModal(),
      error: () => this.showErrorModal()
    });
  }

  private showSuccessModal(): void {
    this.modal.success({
      nzTitle: 'Succès',
      nzContent: 'Vérifiez votre e‑mail pour le lien de réinitialisation du mot de passe.'
    });
  }

  private showErrorModal(): void {
    this.modal.error({
      nzTitle: 'Erreur',
      nzContent: 'Une erreur est survenue. Veuillez réessayer plus tard.'
    });
  }
}
