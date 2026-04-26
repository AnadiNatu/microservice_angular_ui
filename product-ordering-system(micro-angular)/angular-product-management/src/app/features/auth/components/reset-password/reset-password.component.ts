import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { CustomCurrencyPipe } from '../../../../shared/pipes/custom-currency.pipe';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports : [FormsModule , CommonModule , CustomCurrencyPipe , RouterModule , ReactiveFormsModule],
})
export class ResetPasswordComponent {
  resetPasswordForm  : FormGroup;
  isLoading            = false;
  successMessage       = '';
  errorMessage         = '';
  showPassword         = false;
  showConfirmPassword  = false;
 
  constructor(
    private fb         : FormBuilder,
    private authService: AuthService,
    private router     : Router
  ) {
    this.resetPasswordForm = this.fb.group(
      {
        // "identifier" = email or phone; "otp" = 6-digit code from email/SMS
        identifier  : ['', [Validators.required]],
        otp         : ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
        newPassword : ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }
 
  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      Object.values(this.resetPasswordForm.controls).forEach(c => c.markAsTouched());
      return;
    }
 
    const v = this.resetPasswordForm.value;
    const req: ResetPasswordRequest = {
      identifier : v.identifier.trim(),
      otp        : v.otp.trim(),
      newPassword: v.newPassword,
    };
 
    this.isLoading      = true;
    this.errorMessage   = '';
    this.successMessage = '';
 
    // POST /api/password/reset?identifier=...&otp=...&newPassword=...
    this.authService.resetPassword(req).subscribe({
      next: res => {
        this.isLoading      = false;
        this.successMessage = res?.message ?? 'Password reset successfully!';
        setTimeout(() => this.router.navigate(['/auth/login']), 2500);
      },
      error: err => {
        this.isLoading    = false;
        this.errorMessage = err?.error?.message ?? err?.message ?? 'Reset failed. Check your OTP.';
      }
    });
  }
 
  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const pw  = g.get('newPassword');
    const cpw = g.get('confirmPassword');
    if (!pw || !cpw) return null;
    return pw.value === cpw.value ? null : { passwordMismatch: true };
  }
 
  togglePasswordVisibility(f: 'password' | 'confirmPassword'): void {
    if (f === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }
 
  hasError(field: string): boolean {
    const c = this.resetPasswordForm.get(field);
    return !!(c && c.invalid && c.touched);
  }
 
  getErrorMessage(field: string): string {
    const c = this.resetPasswordForm.get(field);
    if (c?.hasError('required'))   return `${this.label(field)} is required`;
    if (c?.hasError('minlength'))  return `At least ${c.errors?.['minlength'].requiredLength} characters`;
    if (c?.hasError('maxlength'))  return 'OTP must be 6 digits';
    return '';
  }
 
  private label(f: string): string {
    const m: Record<string,string> = {
      identifier: 'Email or phone', otp: 'OTP',
      newPassword: 'New password', confirmPassword: 'Confirm password'
    };
    return m[f] ?? f;
  }
 
  goToLogin(): void { this.router.navigate(['/auth/login']); }
}