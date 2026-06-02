import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    const isLoggedIn = this.authService.isLoggedIn();
    const userRole = this.authService.getUserRole();

    // Guard for auth routes (/auth/login, /auth/signup etc.)
    // If user is already logged in with a valid role, redirect to their dashboard
    if (route.data['isAuthRoute']) {
      if (isLoggedIn && userRole === UserRole.ADMIN) {
        return this.router.createUrlTree(['/admin/dashboard']);
      }
      if (isLoggedIn && userRole === UserRole.USER) {
        return this.router.createUrlTree(['/auth/home']);
      }
      return true;
    }

    // Guard for protected routes (/admin etc.)
    if (!isLoggedIn) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const expectedRole = route.data['role'];
    if (expectedRole && userRole !== expectedRole) {
      // Role mismatch — send to their actual dashboard
      if (userRole === UserRole.ADMIN) {
        return this.router.createUrlTree(['/admin/dashboard']);
      }
      return this.router.createUrlTree(['/auth/login']);
    }

    return true;
  }
}