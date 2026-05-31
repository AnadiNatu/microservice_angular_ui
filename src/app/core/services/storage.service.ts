import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Storage keys as constants to prevent typos
  private readonly USER_KEY = 'auth-user';
  private readonly TOKEN_KEY = 'auth-token';

  constructor() {}

  //Save user object to localStorage
  saveUser(user: User): void {
    window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  //Retrieve user object from localStorage
  getUser(): User | null {
    const userJson = window.localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /*Save JWT token to localStorage*/
  saveToken(token: string): void {
    window.localStorage.setItem(this.TOKEN_KEY, token);
  }

  /*Retrieve JWT token from localStorage*/
  getToken(): string | null {
    return window.localStorage.getItem(this.TOKEN_KEY);
  }

  /* Clear all authentication data*/
  clear(): void {
    window.localStorage.removeItem(this.USER_KEY);
    window.localStorage.removeItem(this.TOKEN_KEY);
  }

  /*Check if user is logged in*/
  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }
}