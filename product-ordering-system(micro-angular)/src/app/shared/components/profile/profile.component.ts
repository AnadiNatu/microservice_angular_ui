import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <h2 class="fw-bold mb-4">My Profile</h2>

    <div class="card p-4 mb-4">
      <div class="d-flex align-items-center gap-4 mb-4">
        <div class="position-relative">
          <img [src]="previewImage || user()?.avatar" class="rounded-circle shadow-sm border" width="100" height="100" style="object-fit: cover;">
          <label class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-1" style="width: 32px; height: 32px;">
            <i class="bi bi-camera"></i>
            <input type="file" class="d-none" (change)="onFileSelected($event)" accept="image/*">
          </label>
        </div>
        <div>
          <h3 class="fw-bold mb-1">{{ user()?.name }}</h3>
          <p class="text-muted mb-0">{{ user()?.email }}</p>
          <span class="badge bg-light-blue text-primary mt-2">{{ user()?.role }}</span>
        </div>
      </div>

      <form class="row g-3" #profileForm="ngForm" (ngSubmit)="updateProfile(profileForm)">
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Full Name</label>
          <input type="text" class="form-control" name="name" [ngModel]="user()?.name" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Email Address</label>
          <input type="email" class="form-control" name="email" [ngModel]="user()?.email" readonly>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Phone Number</label>
          <input type="tel" class="form-control" name="phone" [ngModel]="'+1 (555) 000-0000'">
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-semibold">Location</label>
          <input type="text" class="form-control" name="location" [ngModel]="'New York, USA'">
        </div>
        <div class="col-12 mt-4">
          <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || loading">
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Update Profile
          </button>
        </div>
      </form>
    </div>

    <div class="card p-4 mb-4" id="settings">
      <h5 class="fw-bold mb-4">Account Settings</h5>
      <div class="list-group list-group-flush">
        <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
          <div>
            <div class="fw-semibold">Email Notifications</div>
            <div class="text-muted smaller">Receive updates about your orders</div>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-switch form-check-input" type="checkbox" checked>
          </div>
        </div>
        <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
          <div>
            <div class="fw-semibold">Two-Factor Authentication</div>
            <div class="text-muted smaller">Add an extra layer of security</div>
          </div>
          <button class="btn btn-sm btn-outline-primary">Enable</button>
        </div>
      </div>
    </div>

    <div class="card p-4 border-danger-subtle">
      <h5 class="fw-bold text-danger mb-3">Danger Zone</h5>
      <p class="text-muted small">Once you delete your account, there is no going back. Please be certain.</p>
      <button class="btn btn-outline-danger btn-sm">Delete Account</button>
    </div>
  `,
  styles: [`
    .smaller { font-size: 0.75rem; }
  `]
})
export class ProfileComponent implements OnInit {
  user = this.authService.userSignal;
  previewImage: string | null = null;
  loading = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(form: any) {
    if (form.valid) {
      this.loading = true;
      // Simulate API call
      setTimeout(() => {
        const currentUser = this.user();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: form.value.name,
            avatar: this.previewImage || currentUser.avatar
          };
          // In a real app, we'd call a service to update the backend
          // For now, we update the local signal and storage
          this.authService.updateUser(updatedUser);
          alert('Profile updated successfully!');
        }
        this.loading = false;
      }, 1000);
    }
  }
}
