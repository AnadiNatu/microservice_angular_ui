import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials, UserRole } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { CustomCurrencyPipe } from '../../../../shared/pipes/custom-currency.pipe';
import { LoginRequest } from '../../../../core/modules/user.model';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports : [FormsModule , CommonModule , CustomCurrencyPipe , RouterModule , ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  
  loginForm!  : FormGroup;
  isLoading    = false;
  errorMessage = '';
  returnUrl    = '';
  showPassword = false;
 
  // Quick-fill demo buttons – backend credentials
  demoCredentials = {
    admin: {
      username: 'adminuser',
      password: 'admin123',
      label   : 'Admin Account',
      icon    : 'bi-shield-lock-fill',
    },
    user: {
      username: 'testuser',
      password: 'password123',
      label   : 'User Account',
      icon    : 'bi-person-fill',
    }
  };
 
  constructor(
    private fb         : FormBuilder,
    private authService: AuthService,
    private router     : Router,
    private route      : ActivatedRoute
  ) {}
 
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirectToDashboard();
      return;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.loginForm = this.fb.group({
      // Backend LoginRequest uses "username", not "email"
      username  : ['', [Validators.required, Validators.minLength(3)]],
      password  : ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }
 
  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(c => c.markAsTouched());
      return;
    }
    const credentials: LoginRequest = {
      username: this.loginForm.value.username.trim(),
      password: this.loginForm.value.password,
    };
    this.performLogin(credentials);
  }
 
  private performLogin(credentials: LoginRequest): void {
    this.isLoading    = true;
    this.errorMessage = '';
 
    this.authService.login(credentials).subscribe({
      next: user => {
        this.isLoading = false;
        this.showToast(`Welcome back, ${user.username}!`, 'success');
        setTimeout(() => this.redirectToDashboard(), 800);
      },
      error: err => {
        this.isLoading    = false;
        this.errorMessage = err.message ?? 'Invalid username or password.';
        this.shakeCard();
      }
    });
  }
 
  quickLogin(type: 'admin' | 'user'): void {
    const c = this.demoCredentials[type];
    this.loginForm.patchValue({ username: c.username, password: c.password });
    setTimeout(() => this.onSubmit(), 250);
  }
 
  private redirectToDashboard(): void {
    const role = this.authService.getUserRole();
    if (this.returnUrl && this.returnUrl !== '/' && !this.returnUrl.includes('login')) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }
    if (role === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/auth/home']);
    }
  }
 
  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }
 
  hasError(field: string): boolean {
    const c = this.loginForm.get(field);
    return !!(c && c.invalid && c.touched);
  }
 
  getErrorMessage(field: string): string {
    const c = this.loginForm.get(field);
    if (c?.hasError('required'))   return `${field === 'username' ? 'Username' : 'Password'} is required`;
    if (c?.hasError('minlength'))  return `Minimum ${c.errors?.['minlength'].requiredLength} characters`;
    return '';
  }
 
  goToSignup()         { this.router.navigate(['/auth/signup']); }
  goToForgotPassword() { this.router.navigate(['/auth/forgot-password']); }
  goToHome()           { this.router.navigate(['/']); }
 
  private showToast(msg: string, type: 'success' | 'danger'): void {
    const el = document.createElement('div');
    el.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    el.style.zIndex = '9999';
    el.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
 
  private shakeCard(): void {
    const card = document.querySelector('.login-card');
    card?.classList.add('shake');
    setTimeout(() => card?.classList.remove('shake'), 500);
  }
}  