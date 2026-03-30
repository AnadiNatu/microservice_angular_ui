import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-page d-flex align-items-center justify-content-center">
      <div class="card p-4 shadow-lg" style="width: 400px;">
        <div class="text-center mb-4">
          <div class="bg-green d-inline-block p-3 rounded-circle text-white mb-3">
            <i class="bi bi-box-seam fs-1"></i>
          </div>
          <h2 class="fw-bold">Welcome Back</h2>
          <p class="text-muted">Sign in to manage your orders</p>
        </div>

        @if (error) {
          <div class="alert alert-danger small py-2">{{ error }}</div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label small fw-semibold">Email Address</label>
            <input type="email" class="form-control" formControlName="email" placeholder="admin@system.com">
            @if (loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['required']) {
              <div class="text-danger smaller mt-1">Email is required</div>
            }
          </div>

          <div class="mb-4">
            <label class="form-label small fw-semibold">Password</label>
            <input type="password" class="form-control" formControlName="password" placeholder="admin123">
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']) {
              <div class="text-danger smaller mt-1">Password is required</div>
            }
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 mb-3" [disabled]="loginForm.invalid || loading">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Sign In
          </button>

          <div class="text-center small">
            <span class="text-muted">Don't have an account?</span>
            <a href="#" class="text-green fw-semibold ms-1">Sign Up</a>
          </div>
        </form>

        <div class="mt-4 p-3 bg-light rounded small">
          <div class="fw-bold mb-2">Demo Credentials:</div>
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-sm btn-outline-primary text-start" (click)="fillCredentials('ADMIN')">
              <i class="bi bi-person-badge me-2"></i> Admin: admin&#64;system.com
            </button>
            <button type="button" class="btn btn-sm btn-outline-success text-start" (click)="fillCredentials('USER')">
              <i class="bi bi-person me-2"></i> User: user&#64;system.com
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--light-blue) 0%, var(--light-yellow) 100%);
    }
    .smaller { font-size: 0.75rem; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  fillCredentials(role: 'ADMIN' | 'USER') {
    if (role === 'ADMIN') {
      this.loginForm.patchValue({
        email: 'admin@system.com',
        password: 'admin123'
      });
    } else {
      this.loginForm.patchValue({
        email: 'user@system.com',
        password: 'user123'
      });
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/products']);
        }
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
