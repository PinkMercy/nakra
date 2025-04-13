import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule,ReactiveFormsModule,NzButtonModule, NzModalModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
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

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    const email = this.forgotPasswordForm.value.email;
    // appUrl: This URL may be dynamically derived; here we hard-code or use environment settings.
    const appUrl = 'http://localhost:4200';
    this.passwordResetService.requestReset(email, appUrl)
    .subscribe({
      next: (res) => {
        this.success();
      },
      error: (err) => {
        this.success();
      }
    });
  }
  success(): void {
    this.modal.success({
      nzTitle: 'success ',
      nzContent: 'verifier votre email pour le lien de réinitialisation du mot de passe',
    });
  }
}
