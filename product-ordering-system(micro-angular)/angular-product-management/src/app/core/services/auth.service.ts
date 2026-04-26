import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { StorageService } from './storage.service';
import { User, ForgotPasswordRequest, ResetPasswordRequest, UserRole } from '../models/user.model';
import { LoginRequest, AuthResponse, RegisterRequest, RefreshTokenRequest, ValidateTokenResponse, ValidateTokenRequest, ProfileResponse, UpdateProfileRequest, ChangePasswordRequest } from '../modules/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ── All requests go through the API Gateway ───────────────
  private readonly GW = 'http://localhost:8083';

  // ── Reactive state (Angular 17 Signals) ──────────────────
  userSignal       = signal<User | null>(null);
  isAuthenticated  = computed(() => this.userSignal() !== null);
  userRole         = computed(() => this.userSignal()?.roles?.[0] ?? null);
  isAdminSignal    = computed(() => isAdminUser(this.userSignal()));

  constructor(
    private http   : HttpClient,
    private storage: StorageService,
    private router : Router
  ) {
    // Restore session from localStorage on startup
    const saved = this.storage.getUser();
    if (saved) this.userSignal.set(saved);
  }

  // ── Login ─────────────────────────────────────────────────

  /**
   * POST /api/auth/login
   * Backend expects { username, password }
   * Returns AuthResponse → we map it to our User shape and persist session
   */
  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.GW}/api/auth/login`, credentials)
      .pipe(
        tap(res  => this.setSession(res)),
        map(res  => this.mapAuthResponseToUser(res)),
        catchError(err => {
          console.error('[AuthService] login error', err);
          return throwError(() => new Error(
            err.error?.message ?? err.error?.error ?? 'Invalid username or password'
          ));
        })
      );
  }

  // ── Register ──────────────────────────────────────────────

  /**
   * POST /api/auth/register
   * Backend expects { username, password, email, phoneNumber?, roles? }
   */
  register(request: RegisterRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.GW}/api/auth/register`, request)
      .pipe(
        tap(res  => this.setSession(res)),
        map(res  => this.mapAuthResponseToUser(res)),
        catchError(err => {
          console.error('[AuthService] register error', err);
          return throwError(() => new Error(
            err.error?.message ?? err.error?.error ?? 'Registration failed'
          ));
        })
      );
  }

  // ── Token refresh ─────────────────────────────────────────

  /**
   * POST /api/auth/refresh
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    const body: RefreshTokenRequest = { refreshToken };
    return this.http
      .post<AuthResponse>(`${this.GW}/api/auth/refresh`, body)
      .pipe(
        tap(res => {
          this.storage.saveToken(res.token);
          this.storage.saveRefreshToken(res.refreshToken);
        }),
        catchError(err => {
          this.logout();
          return throwError(() => err);
        })
      );
  }

  // ── Token validation ──────────────────────────────────────

  /**
   * POST /api/auth/validate
   */
  validateToken(token: string): Observable<ValidateTokenResponse> {
    const body: ValidateTokenRequest = { token };
    return this.http.post<ValidateTokenResponse>(`${this.GW}/api/auth/validate`, body);
  }

  // ── Profile ───────────────────────────────────────────────

  /**
   * GET /api/profile/me  (requires JWT)
   */
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.GW}/api/profile/me`);
  }

  /**
   * PUT /api/profile/me  (requires JWT)
   * Body: { username?, phoneNumber? }
   */
  updateProfile(request: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.GW}/api/profile/me`, request).pipe(
      tap(() => {
        // Keep local signal in sync
        const current = this.userSignal();
        if (current) {
          const updated: User = {
            ...current,
            ...(request.username    ? { username   : request.username    } : {}),
            ...(request.phoneNumber ? { phoneNumber: request.phoneNumber } : {}),
          };
          this.storage.saveUser(updated);
          this.userSignal.set(updated);
        }
      })
    );
  }

  /**
   * POST /api/profile/photo  (multipart/form-data, requires JWT)
   */
  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.GW}/api/profile/photo`, formData).pipe(
      tap((res: any) => {
        const current = this.userSignal();
        if (current && res?.photoUrl) {
          const updated: User = { ...current, profilePicture: res.photoUrl };
          this.storage.saveUser(updated);
          this.userSignal.set(updated);
        }
      })
    );
  }

  /**
   * DELETE /api/profile/photo  (requires JWT)
   */
  deleteProfilePhoto(): Observable<any> {
    return this.http.delete(`${this.GW}/api/profile/photo`).pipe(
      tap(() => {
        const current = this.userSignal();
        if (current) {
          const updated: User = { ...current, profilePicture: undefined };
          this.storage.saveUser(updated);
          this.userSignal.set(updated);
        }
      })
    );
  }

  // ── Password flows ────────────────────────────────────────

  /**
   * POST /api/password/forgot?email=...&method=email
   */
  forgotPassword(req: ForgotPasswordRequest): Observable<any> {
    const params = new HttpParams()
      .set('email', req.email)
      .set('method', req.method ?? 'email');
    return this.http.post(`${this.GW}/api/password/forgot`, null, { params });
  }

  /**
   * POST /api/password/reset?identifier=...&otp=...&newPassword=...
   */
  resetPassword(req: ResetPasswordRequest): Observable<any> {
    const params = new HttpParams()
      .set('identifier', req.identifier)
      .set('otp',        req.otp)
      .set('newPassword', req.newPassword);
    return this.http.post(`${this.GW}/api/password/reset`, null, { params });
  }

  /**
   * POST /api/password/change?email=...&currentPassword=...&newPassword=...
   */
  changePassword(req: ChangePasswordRequest): Observable<any> {
    const params = new HttpParams()
      .set('email',           req.email)
      .set('currentPassword', req.currentPassword)
      .set('newPassword',     req.newPassword);
    return this.http.post(`${this.GW}/api/password/change`, null, { params });
  }

  // ── OTP flows ─────────────────────────────────────────────

  /** POST /api/otp/send/email?email=... */
  sendEmailOtp(email: string): Observable<any> {
    return this.http.post(`${this.GW}/api/otp/send/email`, null,
      { params: new HttpParams().set('email', email) });
  }

  /** POST /api/otp/verify/email?email=...&otp=... */
  verifyEmailOtp(email: string, otp: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.post(`${this.GW}/api/otp/verify/email`, null, { params });
  }

  /** POST /api/auth/phone/send-otp?phone=... */
  sendPhoneOtp(phone: string): Observable<any> {
    return this.http.post(`${this.GW}/api/auth/phone/send-otp`, null,
      { params: new HttpParams().set('phone', phone) });
  }

  /** POST /api/auth/phone/verify-otp?phone=...&otp=...  → returns JWT */
  verifyPhoneOtp(phone: string, otp: string): Observable<any> {
    const params = new HttpParams().set('phone', phone).set('otp', otp);
    return this.http.post(`${this.GW}/api/auth/phone/verify-otp`, null, { params });
  }

  // ── Session helpers ───────────────────────────────────────

  logout(): void {
    this.storage.clear();
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!this.storage.getToken() && this.userSignal() !== null;
  }

  getUserRole(): UserRole | null {
    const roles = this.userSignal()?.roles;
    if (!roles) return null;
    if (roles.includes(UserRole.ADMIN)) return UserRole.ADMIN;
    if (roles.includes(UserRole.USER))  return UserRole.USER;
    return null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === UserRole.ADMIN;
  }

  isUser(): boolean {
    return this.getUserRole() === UserRole.USER;
  }

  getCurrentUser(): User | null {
    return this.userSignal();
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  // ── Private helpers ───────────────────────────────────────

  /** Persist JWT + refresh token and update signal */
  private setSession(res: AuthResponse): void {
    this.storage.saveToken(res.token);
    this.storage.saveRefreshToken(res.refreshToken);
    const user = this.mapAuthResponseToUser(res);
    this.storage.saveUser(user);
    this.userSignal.set(user);
  }

  /**
   * Map AuthResponse → User
   * Backend sends { username, email, roles[], token, ... }
   * We flatten into our User shape
   */
  private mapAuthResponseToUser(res: AuthResponse): User {
    const existing = this.storage.getUser();
    return {
      id            : existing?.id ?? 0,  // filled in by getProfile() call
      username      : res.username,
      email         : res.email,
      roles        : res.roles,
      phoneNumber   : existing?.phoneNumber,
      profilePicture: existing?.profilePicture,
      provider      : existing?.provider ?? 'LOCAL',
    };
  }
}

function isAdminUser(arg0: any): any {
  throw new Error('Function not implemented.');
}
