import { Injectable } from '@angular/core';
import {
  CanActivate, ActivatedRouteSnapshot,
  RouterStateSnapshot, Router, UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router     : Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    // 1. Must be logged in
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(
        ['/auth/login'],
        { queryParams: { returnUrl: state.url } }
      );
    }

    // 2. Role check (route.data.role must match exactly, e.g. 'ROLE_ADMIN')
    const expectedRole: string | undefined = route.data['role'];
    if (expectedRole) {
      const userRoles = this.authService.getCurrentUser()?.roles ?? [];

      if (!userRoles.includes(expectedRole)) {
        if (userRoles.includes(UserRole.ADMIN)) {
          return this.router.createUrlTree(['/admin/dashboard']);
        }
        return this.router.createUrlTree(['/auth/login']);
      }
    }

    return true;
  }
}