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

/**
 * AuthGuard - Protects routes from unauthorized access
 * Features:
 * - Checks if user is logged in
 * - Validates user role matches route requirements
 * - Redirects to login if unauthorized
 * - Preserves return URL for redirect after login
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * CanActivate implementation
   * @param route - Contains route data including required role
   * @param state - Contains URL state for return URL preservation
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    
    console.log('AuthGuard: Checking access to', state.url);

    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      console.log('AuthGuard: User not logged in, redirecting to login');
      
      // Redirect to login with return URL
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Get expected role from route data
    const expectedRole = route.data['role'];
    const userRole = this.authService.getUserRole();

    console.log('AuthGuard: Expected role:', expectedRole, 'User role:', userRole);

    // If route requires specific role, validate it
    if (expectedRole && userRole !== expectedRole) {
      console.log('AuthGuard: Role mismatch, access denied');
      
      // Redirect to appropriate dashboard based on user role
      if (userRole === 'ADMIN') {
        return this.router.createUrlTree(['/admin/dashboard']);
      } else if (userRole === 'USER') {
        return this.router.createUrlTree(['/user/products']);
      } else {
        return this.router.createUrlTree(['/auth/login']);
      }
    }

    // Access granted
    console.log('AuthGuard: Access granted');
    return true;
  }
}