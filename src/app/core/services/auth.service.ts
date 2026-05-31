import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User, LoginCredentials, SignUpDTO, UserRole, ForgotPasswordRequest, ResetPasswordRequest } from '../models/user.model';
import { StorageService } from './storage.service';

/**
 * AuthService - Handles authentication and user state management
 * Features:
 * - Angular Signals for reactive state
 * - BehaviorSubject for Observable compatibility
 * - Mock authentication (no real backend)
 * - LocalStorage persistence
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base URL for API (placeholder - using mock data)
  private readonly BASE_URL = 'http://localhost:8080/api/auth/';

  // Traditional RxJS approach (for compatibility)
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Modern Angular Signals approach (Angular 17+)
  public userSignal = signal<User | null>(null);
  
  // Computed signal - derived state
  public isAuthenticated = computed(() => this.userSignal() !== null);
  public userName = computed(() => this.userSignal()?.fname || 'Guest');
  public userRole = computed(() => this.userSignal()?.role || null);

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) {
    // Initialize state from localStorage on service creation
    this.initializeAuthState();
  }

  /* Initialize authentication state from localStorage*/
  private initializeAuthState(): void {
    const savedUser = this.storageService.getUser();
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
      this.userSignal.set(savedUser);
      console.log('Auth state restored from localStorage:', savedUser);
    }
  }

  /*
   - Login with credentials
   - Mock implementation - replace with real API call*/
  login(credentials: LoginCredentials): Observable<User> {
    console.log('Login attempt:', credentials.email);

    // Mock authentication logic
    return this.mockLogin(credentials).pipe(
      delay(1000), // Simulate network delay
      tap(user => this.setSession(user)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mock login implementation
   * In production, replace with: this.http.post<AuthenticationResponse>()
   */
  private mockLogin(credentials: LoginCredentials): Observable<User> {
    // Admin credentials
    if (credentials.email === 'admin@system.com' && credentials.password === 'admin123') {
      const adminUser: User = {
        id: 1,
        fname: 'System',
        lname: 'Administrator',
        email: credentials.email,
        role: UserRole.ADMIN,
        phoneNumber: '+1 (555) 123-4567',
        avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=4f46e5&color=fff'
      };
      return of(adminUser);
    }
    
    // Regular user credentials
    if (credentials.email === 'user@system.com' && credentials.password === 'user123') {
      const normalUser: User = {
        id: 2,
        fname: 'John',
        lname: 'Doe',
        email: credentials.email,
        role: UserRole.USER,
        phoneNumber: '+1 (555) 987-6543',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff'
      };
      return of(normalUser);
    }

    // Invalid credentials
    return throwError(() => new Error('Invalid email or password'));
  }

  /**
   * Set user session (both localStorage and signals)
   */
  private setSession(user: User): void {
    // Generate mock JWT token
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    // Save to localStorage
    this.storageService.saveUser(user);
    this.storageService.saveToken(mockToken);

    // Update reactive state
    this.currentUserSubject.next(user);
    this.userSignal.set(user);

    console.log('Session established for:', user.email);
  }

  /**
   * Signup new user
   * Mock implementation
   */
  signup(data: SignUpDTO): Observable<User> {
    console.log('Signup attempt:', data.email);

    // Mock signup - in production: this.http.post<User>(`${this.BASE_URL}signup`, data)
    return of({
      id: Math.floor(Math.random() * 10000),
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      role: UserRole.USER,
      phoneNumber: data.phoneNumber,
      avatar: `https://ui-avatars.com/api/?name=${data.fname}+${data.lname}&background=random`
    }).pipe(
      delay(1000),
      tap(() => console.log('User registered successfully'))
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    console.log('Logging out user');
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Update user profile
   */
  updateUser(user: User): void {
    this.storageService.saveUser(user);
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
    console.log('User profile updated');
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Get user role
   */
  getUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Forgot password request
   * Mock implementation
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    console.log('Forgot password request for:', request.email);
    return of('Password reset link sent to your email').pipe(delay(1000));
  }

  /**
   * Reset password
   * Mock implementation
   */
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    console.log('Password reset for:', request.email);
    return of(void 0).pipe(delay(1000));
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.getUserRole() === UserRole.ADMIN;
  }

  /**
   * Check if user is regular user
   */
  isUser(): boolean {
    return this.getUserRole() === UserRole.USER;
  }
}