import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials, UserRole } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [RouterModule, CommonModule , ReactiveFormsModule , FormsModule],
  standalone: true
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
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
) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });
}

 ngOnInit(): void {

  this.returnUrl =
    this.route.snapshot.queryParams['returnUrl'] || '/';

  if (this.authService.isLoggedIn()) {
    this.redirectToDashboard();
  }
}

  // private initializeForm(): void {
  //   this.loginForm = this.fb.group({
  //     email: ['', [Validators.required, Validators.email]],
  //     password: ['', [Validators.required, Validators.minLength(6)]],
  //     rememberMe: [false]
  //   });
  // }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const credentials: LoginCredentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.performLogin(credentials);
  }

  private performLogin(credentials: LoginCredentials): void {
    this.setLoadingState(true);
    this.errorMessage = '';

    this.authService.login(credentials).subscribe({
      next: (user) => {
        this.setLoadingState(false);
        this.showSuccessMessage(user['username'] ?? user.email ?? 'User');
        setTimeout(() => {
          this.redirectToDashboard();
        }, 1000);
      },
      error: (error) => {
        this.setLoadingState(false);
        this.errorMessage = error.message || 'Invalid email or password. Please try again.';
        this.shakeForm();
      }
    });
  }

  private setLoadingState(loading: boolean): void {

  this.isLoading = loading;

  if (loading) {
    this.loginForm.disable();
  } else {
    this.loginForm.enable();
  }

}

  quickLogin(type: 'admin' | 'user'): void {
    const credentials = this.demoCredentials[type];
    this.loginForm.patchValue({
      email: credentials.email,
      password: credentials.password
    });
    setTimeout(() => {
      this.onSubmit();
    }, 300);
  }

  private redirectToDashboard(): void {
    const userRole = this.authService.getUserRole();

    if (this.returnUrl && this.returnUrl !== '/' && !this.returnUrl.includes('login')) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    if (userRole === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else if (userRole === UserRole.USER) {
      this.router.navigate(['/user/products']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private showSuccessMessage(userName: string): void {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    successDiv.style.zIndex = '9999';
    successDiv.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Welcome back, ${userName}!`;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 2000);
  }

  private shakeForm(): void {
    const formElement = document.querySelector('.login-card');
    formElement?.classList.add('shake');
    setTimeout(() => formElement?.classList.remove('shake'), 500);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

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

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}  