import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone : true
})
export class HeaderComponent implements OnInit {
  
  user !: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('HeaderComponent initialized, user:', this.user());
  }

  ngOnInit(): void {
    this.user = this.authService.userSignal;
    console.log("Header Component initialized , user:" , this.user())
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