import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials, UserRole } from '../../../../core/models/user.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '';
  showPassword: boolean = false;

demoCredentials = {
    admin: {
      email: 'admin@system.com',
      password: 'admin123',
      label: 'Admin Account',
      icon: 'bi-shield-lock-fill',
      color: 'danger'
    },
    user: {
      email: 'user@system.com',
      password: 'user123',
      label: 'User Account',
      icon: 'bi-person-fill',
      color: 'success'
    }
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToDashboard();
      return;
    }

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Initialize login form with validators
    this.initializeForm();

    console.log('LoginComponent initialized');
  }

  /**
   * Initialize reactive form
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Get form values
    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.performLogin(credentials);
  }

  /**
   * Perform login operation
   */
  private performLogin(credentials: LoginCredentials): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(credentials).subscribe({
      next: (user) => {
        console.log('Login successful:', user);
        this.isLoading = false;
        
        // Show success message
        this.showSuccessMessage(user.fname);
        
        // Redirect based on role
        setTimeout(() => {
          this.redirectToDashboard();
        }, 1000);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Invalid email or password. Please try again.';
        
        // Shake animation for error
        this.shakeForm();
      }
    });
  }

  /**
   * Quick login with demo credentials
   */
  quickLogin(type: 'admin' | 'user'): void {
    const credentials = this.demoCredentials[type];
    
    // Fill form
    this.loginForm.patchValue({
      email: credentials.email,
      password: credentials.password
    });

    // Auto-submit after short delay
    setTimeout(() => {
      this.onSubmit();
    }, 300);
  }

  /**
   * Redirect to appropriate dashboard based on user role
   */
  private redirectToDashboard(): void {
    const userRole = this.authService.getUserRole();
    
    // If there's a return URL and it's not the login page, use it
    if (this.returnUrl && this.returnUrl !== '/' && !this.returnUrl.includes('login')) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // Otherwise, redirect based on role
    if (userRole === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else if (userRole === UserRole.USER) {
      this.router.navigate(['/user/products']);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Show success message
   */
  private showSuccessMessage(userName: string): void {
    // Create temporary success element
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    successDiv.style.zIndex = '9999';
    successDiv.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>
      Welcome back, ${userName}!
    `;
    document.body.appendChild(successDiv);

    // Remove after 2 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 2000);
  }

  /**
   * Shake form animation for error
   */
  private shakeForm(): void {
    const formElement = document.querySelector('.login-card');
    formElement?.classList.add('shake');
    setTimeout(() => {
      formElement?.classList.remove('shake');
    }, 500);
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName === 'email' ? 'Email' : 'Password'} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    
    return '';
  }

  /**
   * Navigate to signup
   */
  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  /**
   * Navigate to forgot password
   */
  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Navigate to home
   */
  goToHome(): void {
    this.router.navigate(['/']);
  }
}  