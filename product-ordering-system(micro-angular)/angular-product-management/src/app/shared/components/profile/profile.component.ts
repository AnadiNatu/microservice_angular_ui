import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomCurrencyPipe } from '../../pipes/custom-currency.pipe';
import { ProfileResponse, UpdateProfileRequest } from '../../../core/modules/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone : true,
  imports: [FormsModule , CommonModule , CustomCurrencyPipe , RouterLink , ReactiveFormsModule],
})
export class ProfileComponent implements OnInit {
 profileForm !: FormGroup;
  currentUser  : User | null = null;
  isEditMode   = false;
  isLoading    = false;
  isSaving     = false;
  successMsg   = '';
  errorMsg     = '';
 
  // Photo upload state
  selectedFile  : File | null = null;
  photoPreview  : string | null = null;
  isUploadingPhoto = false;
 
  constructor(
    private fb         : FormBuilder,
    private authService: AuthService
  ) {}
 
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initForm();
    this.loadProfileFromBackend();
  }
 
  // ── Backend fetch ─────────────────────────────────────────
 
  /**
   * GET /api/profile/me (JWT required)
   * Refreshes local user signal with the latest data from auth-service.
   */
  private loadProfileFromBackend(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (profile: ProfileResponse) => {
        this.isLoading = false;
        // Patch the in-memory user with full backend data
        const updated: User = {
          id            : profile.id,
          username      : profile.username,
          email         : profile.email,
          roles         : profile.roles,
          phoneNumber   : profile.phoneNumber,
          profilePicture: profile.profilePicture,
          provider      : profile.provider,
        };
        this.currentUser = updated;
        this.initForm();
      },
      error: () => {
        this.isLoading = false;
        // Fall back to cached user from localStorage
      }
    });
  }
 
  // ── Form ──────────────────────────────────────────────────
 
  private initForm(): void {
    this.profileForm = this.fb.group({
      username   : [
        { value: this.currentUser?.username ?? '', disabled: !this.isEditMode },
        [Validators.required, Validators.minLength(3)]
      ],
      email      : [
        { value: this.currentUser?.email ?? '', disabled: true }, // read-only
        [Validators.required, Validators.email]
      ],
      phoneNumber: [
        { value: this.currentUser?.phoneNumber ?? '', disabled: !this.isEditMode },
        [Validators.pattern(/^[+]?[\d\s\-()]+$/)]
      ],
    });
  }
 
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.profileForm.get('username')?.enable();
      this.profileForm.get('phoneNumber')?.enable();
    } else {
      // Cancel – restore original values
      this.profileForm.get('username')?.disable();
      this.profileForm.get('phoneNumber')?.disable();
      this.profileForm.patchValue({
        username   : this.currentUser?.username ?? '',
        phoneNumber: this.currentUser?.phoneNumber ?? '',
      });
      this.successMsg = '';
      this.errorMsg   = '';
    }
  }
 
  /** PUT /api/profile/me */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      Object.values(this.profileForm.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.isSaving  = true;
    this.successMsg = '';
    this.errorMsg   = '';
 
    const req: UpdateProfileRequest = {
      username   : this.profileForm.getRawValue().username?.trim(),
      phoneNumber: this.profileForm.getRawValue().phoneNumber?.trim() || undefined,
    };
 
    this.authService.updateProfile(req).subscribe({
      next: () => {
        this.isSaving   = false;
        this.successMsg = 'Profile updated successfully!';
        this.currentUser = this.authService.getCurrentUser();
        this.isEditMode  = false;
        this.profileForm.get('username')?.disable();
        this.profileForm.get('phoneNumber')?.disable();
      },
      error: err => {
        this.isSaving = false;
        this.errorMsg = err?.error?.message ?? 'Update failed. Please try again.';
      }
    });
  }
 
  // ── Photo upload ──────────────────────────────────────────
 
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
 
    // Validate client-side
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = 'File size must be under 5 MB.';
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      this.errorMsg = 'Only JPG, PNG, GIF and WebP images are supported.';
      return;
    }
 
    this.selectedFile = file;
    this.errorMsg     = '';
 
    // Local preview
    const reader = new FileReader();
    reader.onload = e => { this.photoPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }
 
  /** POST /api/profile/photo (multipart) */
  uploadPhoto(): void {
    if (!this.selectedFile) return;
    this.isUploadingPhoto = true;
    this.errorMsg         = '';
 
    this.authService.uploadProfilePhoto(this.selectedFile).subscribe({
      next: res => {
        this.isUploadingPhoto = false;
        this.successMsg       = 'Profile photo updated successfully!';
        this.currentUser      = this.authService.getCurrentUser();
        this.selectedFile     = null;
        this.photoPreview     = null;
      },
      error: err => {
        this.isUploadingPhoto = false;
        this.errorMsg = err?.error?.message ?? 'Photo upload failed.';
      }
    });
  }
 
  /** DELETE /api/profile/photo */
  removePhoto(): void {
    if (!confirm('Remove your profile photo?')) return;
    this.authService.deleteProfilePhoto().subscribe({
      next: () => {
        this.successMsg  = 'Profile photo removed.';
        this.currentUser = this.authService.getCurrentUser();
        this.photoPreview = null;
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'Failed to remove photo.';
      }
    });
  }
 
  // ── Display helpers ───────────────────────────────────────
 
  getAvatarUrl(): string {
    if (this.photoPreview) return this.photoPreview;
    if (this.currentUser?.profilePicture) return this.currentUser.profilePicture;
    const name = this.currentUser?.username ?? 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;
  }
 
  getRoleLabel(): string {
    return this.currentUser?.roles?.[0]?.replace('ROLE_', '') ?? 'USER';
  }
 
  hasError(field: string): boolean {
    const c = this.profileForm.get(field);
    return !!(c && c.invalid && c.touched);
  }
 
  getErrorMessage(field: string): string {
    const c = this.profileForm.get(field);
    if (c?.hasError('required'))  return `${field} is required`;
    if (c?.hasError('minlength')) return `At least ${c.errors?.['minlength'].requiredLength} characters`;
    if (c?.hasError('pattern'))   return 'Invalid phone number format';
    return '';
  }
}