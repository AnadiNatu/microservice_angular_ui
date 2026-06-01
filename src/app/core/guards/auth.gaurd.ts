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
    const expectedRole = route.data['role'];

    // --- Protect auth routes from already-logged-in users ---
    // If the target is under /auth and the user is already authenticated,
    // send them straight to their dashboard so they never see login again.
    if (route.data['isAuthRoute']) {
      if (isLoggedIn && userRole) {
        return userRole === UserRole.ADMIN
          ? this.router.createUrlTree(['/admin/dashboard'])
          : this.router.createUrlTree(['/auth/home']);
      }
      return true;
    }

    // --- Protect private routes ---
    if (!isLoggedIn) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Role check
    if (expectedRole && userRole !== expectedRole) {
      return userRole === UserRole.ADMIN
        ? this.router.createUrlTree(['/admin/dashboard'])
        : this.router.createUrlTree(['/auth/home']);
    }

    return true;
  }
}