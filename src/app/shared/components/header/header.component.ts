import { Component, Signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from '../../directives/highlight.directive';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule]
})
export class HeaderComponent {
  user: Signal<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.userSignal;
  }

  logout(): void {
    this.authService.logout();
  }

  getFullName(): string {
    const u = this.user();
    return u ? `${u.fname} ${u.lname}` : 'Guest';
  }

  getInitials(): string {
    const u = this.user();
    if (!u) return 'G';
    return `${u.fname.charAt(0)}${u.lname.charAt(0)}`.toUpperCase();
  }
}