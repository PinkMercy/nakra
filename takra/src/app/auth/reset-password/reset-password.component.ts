import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
@Component({
  selector: 'app-reset-password',
  imports: [CommonModule,ReactiveFormsModule,NzButtonModule, NzModalModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null;
  message: string | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private passwordResetService: AuthService,
    private modal: NzModalService
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Retrieve the token from the query parameters.
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.modal.error({
          nzTitle: 'Invalid Link',
          nzContent: 'Invalid password reset link.',
          nzOnOk: () => console.log('Invalid password reset link')
        });
      }
    });
  }

  // Custom validator to confirm passwords match.
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid || !this.token) {
      // If passwords do not match, show a modal notification.
      if (this.resetPasswordForm.hasError('mismatch')) {
        this.modal.error({
          nzTitle: 'Validation Error',
          nzContent: 'Passwords do not match.',
          nzOnOk: () => console.log('Password mismatch error')
        });
      }
      return;
    }
    const newPassword = this.resetPasswordForm.value.newPassword;
    this.passwordResetService.resetPassword(this.token, newPassword).subscribe({
      next: (res) => {
        this.modal.success({
          nzTitle: 'Success',
          nzContent: 'Password has been reset successfully. Please log in with your new password.',
          nzOnOk: () => {
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.modal.error({
          nzTitle: 'Error',
          nzContent: 'Failed to reset password. The token may have expired or is invalid.',
          nzOnOk: () => console.log('Error resetting password')
        });
      }
    });
  }
}
