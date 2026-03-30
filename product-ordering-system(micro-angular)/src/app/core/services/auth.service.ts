import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, LoginCredentials } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Using Signals for modern state management
  public userSignal = signal<User | null>(null);

  constructor(private storageService: StorageService) {
    const savedUser = this.storageService.getUser();
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
      this.userSignal.set(savedUser);
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    // Mock authentication logic
    if (credentials.email === 'admin@system.com' && credentials.password === 'admin123') {
      const adminUser: User = {
        id: '1',
        name: 'System Administrator',
        email: credentials.email,
        role: 'ADMIN',
        avatar: 'https://picsum.photos/seed/admin/100/100'
      };
      return of(adminUser).pipe(
        delay(1000),
        tap(user => this.setSession(user))
      );
    } else if (credentials.email === 'user@system.com' && credentials.password === 'user123') {
      const normalUser: User = {
        id: '2',
        name: 'John Doe',
        email: credentials.email,
        role: 'USER',
        avatar: 'https://picsum.photos/seed/user/100/100'
      };
      return of(normalUser).pipe(
        delay(1000),
        tap(user => this.setSession(user))
      );
    } else {
      return throwError(() => new Error('Invalid credentials')).pipe(delay(1000));
    }
  }

  private setSession(user: User): void {
    this.storageService.saveUser(user);
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
  }

  logout(): void {
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.userSignal.set(null);
  }

  updateUser(user: User): void {
    this.storageService.saveUser(user);
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }
}
