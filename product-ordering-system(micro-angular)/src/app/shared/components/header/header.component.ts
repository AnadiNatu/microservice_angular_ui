import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  template: `
    <nav class="navbar navbar-expand-lg sticky-top">
      <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <div class="bg-green p-1 rounded text-white">
            <i class="bi bi-box-seam"></i>
          </div>
          <span class="fw-bold">OrderFlow</span>
        </a>
        
        <div class="ms-auto d-flex align-items-center gap-3">
          @if (user(); as u) {
            <div class="d-none d-md-block text-end">
              <div class="fw-semibold small">{{ u.name }}</div>
              <div class="text-muted smaller">{{ u.role | titlecase }}</div>
            </div>
            <div class="dropdown">
              <img [src]="u.avatar" class="rounded-circle cursor-pointer border" width="40" height="40" data-bs-toggle="dropdown">
              <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                <li><a class="dropdown-item py-2" [routerLink]="['/' + u.role.toLowerCase(), 'profile']"><i class="bi bi-person me-2"></i> Profile</a></li>
                <li><a class="dropdown-item py-2" [routerLink]="['/' + u.role.toLowerCase(), 'profile']" fragment="settings"><i class="bi bi-gear me-2"></i> Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item py-2 text-danger" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
              </ul>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .smaller { font-size: 0.75rem; }
    .cursor-pointer { cursor: pointer; }
  `]
})
export class HeaderComponent {
  user = this.authService.userSignal;

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
