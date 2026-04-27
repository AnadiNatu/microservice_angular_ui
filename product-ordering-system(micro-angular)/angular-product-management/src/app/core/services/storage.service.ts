import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly USER_KEY  = 'auth-user';
  private readonly TOKEN_KEY = 'auth-token';
  private readonly REFRESH_KEY = 'auth-refresh-token';

  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; }
    catch { return null; }
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  clear(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  logout(): void {
    this.clear();
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }
}