import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { StorageService } from './storage.service';
import { User, ForgotPasswordRequest, ResetPasswordRequest, UserRole } from '../models/user.model';
import {
  LoginRequest, AuthResponse, RegisterRequest, RefreshTokenRequest,
  ValidateTokenResponse, ValidateTokenRequest, ProfileResponse,
  UpdateProfileRequest, ChangePasswordRequest, isAdminUser
} from '../modules/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly GW = 'http://localhost:8083';

  userSignal       = signal<User | null>(null);
  isAuthenticated  = computed(() => this.userSignal() !== null);
  userRole         = computed(() => this.userSignal()?.roles?.[0] ?? null);
  isAdminSignal    = computed(() => isAdminUser(this.userSignal()));

  constructor(
    private http   : HttpClient,
    private storage: StorageService,
    private router : Router
  ) {
    const saved = this.storage.getUser();
    if (saved) this.userSignal.set(saved);
  }

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

  validateToken(token: string): Observable<ValidateTokenResponse> {
    const body: ValidateTokenRequest = { token };
    return this.http.post<ValidateTokenResponse>(`${this.GW}/api/auth/validate`, body);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.GW}/api/profile/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.GW}/api/profile/me`, request).pipe(
      tap(() => {
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

  forgotPassword(req: ForgotPasswordRequest): Observable<any> {
    const params = new HttpParams()
      .set('email', req.email)
      .set('method', req.method ?? 'email');
    return this.http.post(`${this.GW}/api/password/forgot`, null, { params });
  }

  resetPassword(req: ResetPasswordRequest): Observable<any> {
    const params = new HttpParams()
      .set('identifier', req.identifier)
      .set('otp',        req.otp)
      .set('newPassword', req.newPassword);
    return this.http.post(`${this.GW}/api/password/reset`, null, { params });
  }

  changePassword(req: ChangePasswordRequest): Observable<any> {
    const params = new HttpParams()
      .set('email',           req.email)
      .set('currentPassword', req.currentPassword)
      .set('newPassword',     req.newPassword);
    return this.http.post(`${this.GW}/api/password/change`, null, { params });
  }

  sendEmailOtp(email: string): Observable<any> {
    return this.http.post(`${this.GW}/api/otp/send/email`, null,
      { params: new HttpParams().set('email', email) });
  }

  verifyEmailOtp(email: string, otp: string): Observable<any> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.post(`${this.GW}/api/otp/verify/email`, null, { params });
  }

  sendPhoneOtp(phone: string): Observable<any> {
    return this.http.post(`${this.GW}/api/auth/phone/send-otp`, null,
      { params: new HttpParams().set('phone', phone) });
  }

  verifyPhoneOtp(phone: string, otp: string): Observable<any> {
    const params = new HttpParams().set('phone', phone).set('otp', otp);
    return this.http.post(`${this.GW}/api/auth/phone/verify-otp`, null, { params });
  }

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

  private setSession(res: AuthResponse): void {
    this.storage.saveToken(res.token);
    this.storage.saveRefreshToken(res.refreshToken);
    const user = this.mapAuthResponseToUser(res);
    this.storage.saveUser(user);
    this.userSignal.set(user);
  }

  private mapAuthResponseToUser(res: AuthResponse): User {
    const existing = this.storage.getUser();
    return {
      id            : existing?.id ?? 0,
      username      : res.username,
      email         : res.email,
      roles         : Array.isArray(res.roles) ? res.roles : [res.roles as any],
      phoneNumber   : existing?.phoneNumber,
      profilePicture: existing?.profilePicture,
      provider      : existing?.provider ?? 'LOCAL',
    };
  }
}