import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isEditMode: boolean = false;
  uploadedImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get current user from service
    this.currentUser = this.authService.getCurrentUser();

    // Initialize form with user data
    this.initializeForm();

    console.log('ProfileComponent initialized with user:', this.currentUser);
  }

  /**
   * Initialize reactive form with current user data
   */
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      fname: [
        { value: this.currentUser?.fname || '', disabled: !this.isEditMode },
        [Validators.required, Validators.minLength(2)]
      ],
      lname: [
        { value: this.currentUser?.lname || '', disabled: !this.isEditMode },
        [Validators.required, Validators.minLength(2)]
      ],
      email: [
        { value: this.currentUser?.email || '', disabled: true }, // Email always disabled
        [Validators.required, Validators.email]
      ],
      phoneNumber: [
        { value: this.currentUser?.phoneNumber || '', disabled: !this.isEditMode },
        [Validators.pattern(/^[+]?[\d\s\-()]+$/)]
      ]
    });
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      // Enable form controls
      this.profileForm.get('fname')?.enable();
      this.profileForm.get('lname')?.enable();
      this.profileForm.get('phoneNumber')?.enable();
    } else {
      // Disable form controls and reset to original values
      this.profileForm.get('fname')?.disable();
      this.profileForm.get('lname')?.disable();
      this.profileForm.get('phoneNumber')?.disable();
      this.profileForm.patchValue({
        fname: this.currentUser?.fname,
        lname: this.currentUser?.lname,
        phoneNumber: this.currentUser?.phoneNumber
      });
    }
  }

  /**
   * Save profile changes
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Get form values
    const formValue = this.profileForm.getRawValue();

    // Update user object
    if (this.currentUser) {
      const updatedUser: User = {
        ...this.currentUser,
        fname: formValue.fname,
        lname: formValue.lname,
        phoneNumber: formValue.phoneNumber,
        avatar: this.uploadedImage || this.currentUser.avatar
      };

      // Update via service
      this.authService.updateUser(updatedUser);
      this.currentUser = updatedUser;

      console.log('Profile updated:', updatedUser);
      alert('Profile updated successfully!');
    }

    // Exit edit mode
    this.toggleEditMode();
  }

  /**
   * Handle profile picture upload (mock)
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedImage = e.target.result;
        console.log('Image uploaded:', file.name);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Get validation error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid phone number format';
    }
    
    return '';
  }

  /**
   * Check if field has error and is touched
   */
  hasError(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Get display avatar
   */
  getAvatar(): string {
    return this.uploadedImage || this.currentUser?.avatar || 
           `https://ui-avatars.com/api/?name=${this.currentUser?.fname}+${this.currentUser?.lname}&background=random`;
  }
}