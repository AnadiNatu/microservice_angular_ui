import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { CustomCurrencyPipe } from '../../../../shared/pipes/custom-currency.pipe';
import { RegisterRequest } from '../../../../core/modules/user.model';
@Component({
  selector   : 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls  : ['./signup.component.css'],
  standalone : true,
  imports    : [FormsModule, CommonModule, CustomCurrencyPipe, RouterModule, ReactiveFormsModule],
})
export class SignupComponent implements OnInit {
 
  signupForm         !: FormGroup;
  isLoading            = false;
  errorMessage         = '';
  showPassword         = false;
  showConfirmPassword  = false;
  passwordStrength     = 0;
 
  constructor(
    private fb         : FormBuilder,
    private authService: AuthService,
    private router     : Router
  ) {}
 
  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        // Angular keeps fname + lname for display, combined into username on submit
        fname      : ['', [Validators.required, Validators.minLength(2)]],
        lname      : ['', [Validators.required, Validators.minLength(2)]],
        email      : ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.pattern(/^[+]?[\d\s\-()]+$/)]],
        password   : ['', [Validators.required, Validators.minLength(6),
                           this.passwordStrengthValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
 
    this.signupForm.get('password')?.valueChanges.subscribe(p =>
      this.calcStrength(p)
    );
  }
 
  onSubmit(): void {
    if (this.signupForm.invalid) {
      Object.values(this.signupForm.controls).forEach(c => c.markAsTouched());
      return;
    }
    const v = this.signupForm.value;
 
    // Backend RegisterRequest: { username, password, email, phoneNumber?, roles? }
    // username = "firstname.lastname" (unique enough for demo)
    const request: RegisterRequest = {
      username   : `${v.fname.trim()}.${v.lname.trim()}`.toLowerCase(),
      password   : v.password,
      email      : v.email.trim(),
      phoneNumber: v.phoneNumber?.trim() || undefined,
      roles      : ['USER'],  // backend will prefix → ROLE_USER
    };
 
    this.isLoading    = true;
    this.errorMessage = '';
 
    this.authService.register(request).subscribe({
      next: user => {
        this.isLoading = false;
        // Registration auto-logs the user in (backend returns JWT)
        // Redirect to dashboard
        this.router.navigate(['/auth/login']);
      },
      error: err => {
        this.isLoading    = false;
        this.errorMessage = err.message ?? 'Registration failed. Please try again.';
      }
    });
  }
 
  // ── Password helpers ──────────────────────────────────────
 
  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const pw  = g.get('password');
    const cpw = g.get('confirmPassword');
    if (!pw || !cpw) return null;
    return pw.value === cpw.value ? null : { passwordMismatch: true };
  }
 
  private passwordStrengthValidator(c: AbstractControl): ValidationErrors | null {
    const p = c.value || '';
    const ok = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(p)).length;
    return ok >= 3 ? null : { weakPassword: true };
  }
 
  private calcStrength(p: string): void {
    if (!p) { this.passwordStrength = 0; return; }
    let s = 0;
    if (p.length >= 6)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[a-z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    this.passwordStrength = s;
  }
 
  getPasswordStrengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'][this.passwordStrength] ?? '';
  }
 
  getPasswordStrengthColor(): string {
    return ['secondary', 'danger', 'warning', 'info', 'success', 'success'][this.passwordStrength] ?? 'secondary';
  }
 
  // ── UI helpers ────────────────────────────────────────────
 
  togglePasswordVisibility(f: 'password' | 'confirmPassword'): void {
    if (f === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }
 
  hasError(field: string): boolean {
    const c = this.signupForm.get(field);
    return !!(c && c.invalid && c.touched);
  }
 
  getErrorMessage(field: string): string {
    const c = this.signupForm.get(field);
    if (c?.hasError('required'))      return `${this.label(field)} is required`;
    if (c?.hasError('minlength'))     return `At least ${c.errors?.['minlength'].requiredLength} characters`;
    if (c?.hasError('email'))         return 'Enter a valid email address';
    if (c?.hasError('pattern'))       return 'Enter a valid phone number';
    if (c?.hasError('weakPassword'))  return 'Use uppercase, lowercase, number and special character';
    return '';
  }
 
  getFormError(): string {
    return this.signupForm.hasError('passwordMismatch') ? 'Passwords do not match' : '';
  }
 
  private label(f: string): string {
    const m: Record<string,string> = {
      fname: 'First name', lname: 'Last name', email: 'Email',
      phoneNumber: 'Phone', password: 'Password', confirmPassword: 'Confirm password'
    };
    return m[f] ?? f;
  }
 
  goToLogin() { this.router.navigate(['/auth/login']); }
  goToHome()  { this.router.navigate(['/']); }
}