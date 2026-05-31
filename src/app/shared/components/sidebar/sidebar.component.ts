import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true
})
export class SidebarComponent implements OnInit {
  activeRoute: string = '';
  menuItems: MenuItem[] = [];

  // All possible menu items
  private allMenuItems: MenuItem[] = [
    // Admin Menu Items
    {
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      route: '/admin/dashboard',
      roles: [UserRole.ADMIN]
    },
    {
      label: 'Products',
      icon: 'bi-box-seam',
      route: '/admin/products',
      roles: [UserRole.ADMIN]
    },
    {
      label: 'Orders',
      icon: 'bi-cart-check',
      route: '/admin/orders',
      roles: [UserRole.ADMIN]
    },
    {
      label: 'Users',
      icon: 'bi-people',
      route: '/admin/users',
      roles: [UserRole.ADMIN]
    },
    {
      label: 'Order Logs',
      icon: 'bi-journal-text',
      route: '/admin/logs',
      roles: [UserRole.ADMIN],
      children: [
        {
          label: 'By Product',
          icon: 'bi-box',
          route: '/admin/logs/product',
          roles: [UserRole.ADMIN]
        },
        {
          label: 'By User',
          icon: 'bi-person',
          route: '/admin/logs/users',
          roles: [UserRole.ADMIN]
        }
      ]
    },
    {
      label: 'Health Monitor',
      icon: 'bi-heart-pulse',
      route: '/admin/health',
      roles: [UserRole.ADMIN]
    },
    
    // User Menu Items
    {
      label: 'Browse Products',
      icon: 'bi-grid',
      route: '/user/products',
      roles: [UserRole.USER]
    },
    {
      label: 'My Orders',
      icon: 'bi-bag-check',
      route: '/user/orders',
      roles: [UserRole.USER]
    },
    {
      label: 'My Profile',
      icon: 'bi-person-circle',
      route: '/user/profile',
      roles: [UserRole.USER, UserRole.ADMIN]
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Set initial active route
    this.activeRoute = this.router.url;

    // Subscribe to router events to track active route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
      });

    // Filter menu items based on user role
    this.loadMenuItems();
  }

  /*Load menu items based on current user role*/
  private loadMenuItems(): void {
    const userRole = this.authService.getUserRole();
    
    if (!userRole) {
      this.menuItems = [];
      return;
    }

    // Filter menu items that match user's role
    this.menuItems = this.allMenuItems.filter(item => 
      item.roles.includes(userRole)
    );

    console.log('Sidebar menu loaded for role:', userRole, this.menuItems);
  }

  /*Check if route is active*/
  isActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }

  /*Navigate to route*/
  navigate(route: string): void {
    this.router.navigate([route]);
  }
}