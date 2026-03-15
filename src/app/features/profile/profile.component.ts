import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppUserResponse } from '../../core/models/user.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule,
    MatTabsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: AppUserResponse | null = null;
  isLoading = true;
  isSavingProfile = false;
  isSavingPassword = false;
  isSwitchingRole = false;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  hideOld = true;
  hideNew = true;
  hideConfirm = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private notif: NotificationService
  ) {}

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: u => {
        this.user = u;
        this.isLoading = false;
        this.profileForm = this.fb.group({
          name: [u.name, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
          email: [u.email, [Validators.required, Validators.email]]
        });
      },
      error: () => this.isLoading = false
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isSavingProfile = true;
      this.userService.updateUserProfile(this.profileForm.value).subscribe({
        next: u => {
          this.user = u;
          this.isSavingProfile = false;
          this.notif.success('Profile updated successfully!');
        },
        error: err => {
          this.isSavingProfile = false;
          this.notif.error(err.error?.message || 'Update failed');
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isSavingPassword = true;
      const { oldPassword, newPassword } = this.passwordForm.value;
      this.userService.updateUserProfile({ oldPassword, password: newPassword }).subscribe({
        next: () => {
          this.isSavingPassword = false;
          this.notif.success('Password changed successfully!');
          this.passwordForm.reset();
        },
        error: err => {
          this.isSavingPassword = false;
          this.notif.error(err.error?.message || 'Password change failed');
        }
      });
    }
  }

  switchRole(): void {
    if (!this.user || this.isSwitchingRole) return;
    const newRole: 'USER' | 'ADMIN' = this.user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmed = confirm(`Switch your role to ${newRole}? ${newRole === 'ADMIN' ? 'You will be able to upload songs.' : 'You will lose upload access.'}`);
    if (!confirmed) return;

    this.isSwitchingRole = true;
    this.userService.updateUserRole(this.user.id, newRole).subscribe({
      next: updated => {
        this.user = updated;
        this.isSwitchingRole = false;
        // Sync new role and NEW TOKEN to auth state
        const current = this.authService.getCurrentUser();
        if (current) {
          const updatedUser = { 
            ...current, 
            role: updated.role as 'USER' | 'ADMIN' 
          };
          this.authService.updateSession(updatedUser, updated.accessToken);
        }
        this.notif.success(`Role changed to ${newRole} successfully!`);
      },
      error: err => {
        this.isSwitchingRole = false;
        this.notif.error(err.error?.message || 'Role switch failed');
      }
    });
  }

  get joinDate(): string {
    if (!this.user?.createdAt) return '';
    return new Date(this.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
