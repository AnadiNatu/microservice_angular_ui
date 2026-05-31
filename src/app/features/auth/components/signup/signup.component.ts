import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SignUpDTO } from '../../../../core/models/user.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordStrength: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize signup form with validators
   */
  private initializeForm(): void {
    this.signupForm = this.fb.group({
      fname: ['', [Validators.required, Validators.minLength(2)]],
      lname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-()]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Watch password field for strength indicator
    this.signupForm.get('password')?.valueChanges.subscribe(password => {
      this.calculatePasswordStrength(password);
    });
  }

  /**
   * Custom validator: Password match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Custom validator: Password strength
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    return strength >= 3 ? null : { weakPassword: true };
  }

  /**
   * Calculate password strength (0-4)
   */
  private calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    this.passwordStrength = strength;
  }

  /**
   * Get password strength label
   */
  getPasswordStrengthLabel(): string {
    switch (this.passwordStrength) {
      case 0:
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4:
      case 5: return 'Strong';
      default: return '';
    }
  }

  /**
   * Get password strength color
   */
  getPasswordStrengthColor(): string {
    switch (this.passwordStrength) {
      case 0:
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'info';
      case 4:
      case 5: return 'success';
      default: return 'secondary';
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
      return;
    }

    const signupData: SignUpDTO = {
      fname: this.signupForm.value.fname,
      lname: this.signupForm.value.lname,
      email: this.signupForm.value.email,
      phoneNumber: this.signupForm.value.phoneNumber,
      password: this.signupForm.value.password
    };

    this.performSignup(signupData);
  }

  /**
   * Perform signup operation
   */
  private performSignup(data: SignUpDTO): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signup(data).subscribe({
      next: () => {
        console.log('Signup successful');
        this.isLoading = false;
        alert('Account created successfully! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Signup failed:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Signup failed. Please try again.';
      }
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    if (field?.hasError('weakPassword')) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    
    return '';
  }

  /**
   * Get form-level error message
   */
  getFormError(): string {
    if (this.signupForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  /**
   * Get field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fname: 'First name',
      lname: 'Last name',
      email: 'Email',
      phoneNumber: 'Phone number',
      password: 'Password',
      confirmPassword: 'Confirm password'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Navigate to login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigate to home
   */
  goToHome(): void {
    this.router.navigate(['/']);
  }
}