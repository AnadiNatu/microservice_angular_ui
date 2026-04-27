import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, CustomCurrencyPipe, RouterModule],
})
export class UserListComponent implements OnInit {
  users        : any[] = [];
  filteredUsers: any[] = [];
  searchTerm   = '';
  isLoading    = true;

  constructor(
    private adminService: AdminService,
    private router      : Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;

    this.adminService.getAllUsers().subscribe({
      next: users => {
        this.users         = users;
        this.filteredUsers = users;
        this.isLoading     = false;
      },
      error: err => {
        console.error('Error loading users:', err);
        this.isLoading = false;
      }
    });
  }

  searchUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredUsers = this.users;
      return;
    }

    this.filteredUsers = this.users.filter(user => {
      const name  = (user.username ?? `${user.fname ?? ''} ${user.lname ?? ''}`).toLowerCase();
      const email = (user.email ?? '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }

  clearSearch(): void {
    this.searchTerm    = '';
    this.filteredUsers = this.users;
  }

  getRoleBadgeClass(role: string): string {
    return (role ?? '').toUpperCase().includes('ADMIN') ? 'bg-danger' : 'bg-success';
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}