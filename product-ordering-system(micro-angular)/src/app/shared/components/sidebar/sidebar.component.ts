import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidebar">
      <div class="nav flex-column">
        @if (role === 'ADMIN') {
          <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active">
            <i class="bi bi-speedometer2"></i> Dashboard
          </a>
          <a class="nav-link" routerLink="/admin/products" routerLinkActive="active">
            <i class="bi bi-grid"></i> Products
          </a>
          <a class="nav-link" routerLink="/admin/orders" routerLinkActive="active">
            <i class="bi bi-cart-check"></i> Orders
          </a>
          <a class="nav-link" routerLink="/admin/health" routerLinkActive="active">
            <i class="bi bi-activity"></i> System Health
          </a>
          <a class="nav-link" routerLink="/admin/profile" routerLinkActive="active">
            <i class="bi bi-person-circle"></i> My Profile
          </a>
          <a class="nav-link" routerLink="/admin/profile" fragment="settings" routerLinkActive="active">
            <i class="bi bi-gear"></i> Settings
          </a>
        } @else {
          <a class="nav-link" routerLink="/user/products" routerLinkActive="active">
            <i class="bi bi-shop"></i> Browse Products
          </a>
          <a class="nav-link" routerLink="/user/my-orders" routerLinkActive="active">
            <i class="bi bi-bag"></i> My Orders
          </a>
          <a class="nav-link" routerLink="/user/profile" routerLinkActive="active">
            <i class="bi bi-person-circle"></i> My Profile
          </a>
          <a class="nav-link" routerLink="/user/profile" fragment="settings" routerLinkActive="active">
            <i class="bi bi-gear"></i> Settings
          </a>
        }
      </div>
    </div>
  `
})
export class SidebarComponent {
  role = this.authService.getUserRole();

  constructor(private authService: AuthService) {}
}
