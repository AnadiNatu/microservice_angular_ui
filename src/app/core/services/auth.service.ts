import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User, LoginCredentials, SignUpDTO, UserRole, ForgotPasswordRequest, ResetPasswordRequest } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly BASE_URL = 'http://localhost:8080/api/auth/';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public userSignal = signal<User | null>(null);
  public isAuthenticated = computed(() => this.userSignal() !== null);
  public userName = computed(() => this.userSignal()?.fname || 'Guest');
  public userRole = computed(() => this.userSignal()?.role || null);

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const savedUser = this.storageService.getUser();
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
      this.userSignal.set(savedUser);
      console.log('Auth state restored:', savedUser.email, '| role:', savedUser.role);
    } else {
      this.currentUserSubject.next(null);
      this.userSignal.set(null);
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.mockLogin(credentials).pipe(
      delay(1000),
      tap(user => this.setSession(user)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  private mockLogin(credentials: LoginCredentials): Observable<User> {
    if (credentials.email === 'admin@system.com' && credentials.password === 'admin123') {
      return of({
        id: 1,
        fname: 'System',
        lname: 'Administrator',
        email: credentials.email,
        role: UserRole.ADMIN,
        phoneNumber: '+1 (555) 123-4567',
        avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=4f46e5&color=fff'
      });
    }

    if (credentials.email === 'user@system.com' && credentials.password === 'user123') {
      return of({
        id: 2,
        fname: 'John',
        lname: 'Doe',
        email: credentials.email,
        role: UserRole.USER,
        phoneNumber: '+1 (555) 987-6543',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff'
      });
    }

    return throwError(() => new Error('Invalid email or password'));
  }

  private setSession(user: User): void {
    const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;
    this.storageService.saveUser(user);
    this.storageService.saveToken(mockToken);
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
    console.log('Session established for:', user.email);
  }

  signup(data: SignUpDTO): Observable<User> {
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

  logout(): void {
    console.log('Logging out:', this.currentUserSubject.value?.email);

    // Step 1 — wipe localStorage completely
    this.storageService.clear();

    // Step 2 — reset all reactive state atomically
    this.currentUserSubject.next(null);
    this.userSignal.set(null);

    // Step 3 — navigate to login, replacing history so back button
    // cannot return to a protected page
    this.router.navigate(['/auth/login'], { replaceUrl: true });

    console.log('Logout complete.');
  }

  updateUser(user: User): void {
    this.storageService.saveUser(user);
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    return of('Password reset link sent to your email').pipe(delay(1000));
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return of(void 0).pipe(delay(1000));
  }

  isAdmin(): boolean {
    return this.getUserRole() === UserRole.ADMIN;
  }

  isUser(): boolean {
    return this.getUserRole() === UserRole.USER;
  }
}