import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { StorageService } from '../../../core/services/storage.service';
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
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SidebarComponent implements OnInit {
  activeRoute: string = '';
  menuItems: MenuItem[] = [];

  private allMenuItems: MenuItem[] = [
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
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService : StorageService
  ) {}

  ngOnInit(): void {
    this.activeRoute = this.router.url;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
      });

    this.loadMenuItems();
  }

  private loadMenuItems(): void {
    const userRole = this.authService.getUserRole();
    
    if (!userRole) {
      this.menuItems = [];
      return;
    }

    this.menuItems = this.allMenuItems.filter(item => 
      item.roles.includes(userRole)
    );

    console.log('Sidebar menu loaded for role:', userRole, this.menuItems);
  }

  isActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

logout() : void{
  this.storageService.logout();
  this.router.navigateByUrl('/auth/login' , {replaceUrl : true}).then( () => {window.location.reload();});
}
}