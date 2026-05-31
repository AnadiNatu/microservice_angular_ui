import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from '../../directives/highlight.directive';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
   imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , HeaderComponent , SidebarComponent],
  standalone : true
})
export class HeaderComponent {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('HeaderComponent initialized, user:', this.user());
  
    // user = this.authService.userSignal;
  }
  
    user(): any {
        throw new Error('Method not implemented.');
    }


  /**
   * Logout user and redirect to login
   */
  logout(): void {
    console.log('User logging out');
    this.authService.logout();
    // AuthService handles redirect to login
  }

  /**
   * Get full name for display
   */
  getFullName(): string {
    const u = this.user();
    return u ? `${u.fname} ${u.lname}` : 'Guest';
  }

  /**
   * Get initials for avatar fallback
   */
  getInitials(): string {
    const u = this.user();
    if (!u) return 'G';
    return `${u.fname.charAt(0)}${u.lname.charAt(0)}`.toUpperCase();
  }
}