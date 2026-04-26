import { Component, OnInit, Signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { User } from '../../../core/models/user.model';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe]
})
export class HeaderComponent implements OnInit {
 user!: Signal<User | null>;
 
  constructor(
    private authService: AuthService,
    private router     : Router
  ) {}
 
  ngOnInit(): void {
    this.user = this.authService.userSignal;
  }
 
  logout(): void {
    this.authService.logout();
  }
 
  /**
   * Backend stores a single "username" field (no fname / lname split).
   * Display it as-is; capitalise the first letter for polish.
   */
  getDisplayName(): string {
    const u = this.user();
    if (!u) return 'Guest';
    // username might be "john.doe" — convert to "John Doe"
    return u.username
      .split('.')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
 
  /** Two-character initials from the username */
  getInitials(): string {
    const u = this.user();
    if (!u) return 'G';
    const parts = u.username.split('.');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return u.username.slice(0, 2).toUpperCase();
  }
 
  /** Profile picture URL from Cloudinary (backend field: profilePicture) */
  getAvatarUrl(): string | null {
    return this.user()?.profilePicture ?? null;
  }
 
  navigateToProfile(): void {
    this.router.navigate(['/admin/profile']);
  }
}
