import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ForgotPasswordRequest } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { CustomCurrencyPipe } from '../../../../shared/pipes/custom-currency.pipe';

@Component({
  selector   : 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls  : ['./forgot-password.component.css'],
  standalone : true,
  imports    : [FormsModule, CommonModule, CustomCurrencyPipe, RouterModule, ReactiveFormsModule],
})
export class ForgotPasswordComponent {
 
  forgotPasswordForm: FormGroup;
  isLoading      = false;
  successMessage = '';
  errorMessage   = '';
  selectedMethod: 'email' | 'sms' = 'email';
 
  constructor(
    private fb         : FormBuilder,
    private authService: AuthService,
    private router     : Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      method: ['email']
    });
  }
 
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.get('email')?.markAsTouched();
      return;
    }
 
    const req: ForgotPasswordRequest = {
      email : this.forgotPasswordForm.value.email.trim(),
      method: this.forgotPasswordForm.value.method as 'email' | 'sms'
    };
 
    this.isLoading      = true;
    this.errorMessage   = '';
    this.successMessage = '';
 
    // POST /api/password/forgot?email=...&method=email
    this.authService.forgotPassword(req).subscribe({
      next: res => {
        this.isLoading      = false;
        this.successMessage = res?.message ?? 'OTP sent! Check your email or phone.';
        setTimeout(() => this.router.navigate(['/auth/reset-password']), 3000);
      },
      error: err => {
        this.isLoading    = false;
        this.errorMessage = err?.error?.message ?? err?.message ?? 'Something went wrong.';
      }
    });
  }
 
  hasEmailError(): boolean {
    const c = this.forgotPasswordForm.get('email');
    return !!(c && c.invalid && c.touched);
  }
 
  getEmailError(): string {
    const c = this.forgotPasswordForm.get('email');
    if (c?.hasError('required')) return 'Email is required';
    if (c?.hasError('email'))    return 'Enter a valid email address';
    return '';
  }
 
  goToLogin(): void { this.router.navigate(['/auth/login']); }
}