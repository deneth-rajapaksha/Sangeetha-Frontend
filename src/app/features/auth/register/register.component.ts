import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-circle c1"></div>
        <div class="bg-circle c2"></div>
        <div class="bg-circle c3"></div>
      </div>
      <div class="auth-card">
        <div class="brand">
          <span class="brand-icon">🎵</span>
          <span class="brand-name">Sangeetha</span>
        </div>
        <h1 class="auth-title">Create account</h1>
        <p class="auth-subtitle">Start your musical journey today</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="field-group">
            <label>Full Name</label>
            <mat-form-field appearance="fill" class="field">
              <input matInput formControlName="name" placeholder="Your name"/>
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>
          </div>

          <div class="field-group">
            <label>Email</label>
            <mat-form-field appearance="fill" class="field">
              <input matInput type="email" formControlName="email" placeholder="your@email.com"/>
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
            </mat-form-field>
          </div>

          <div class="account-type">
            <label class="type-label">Account Type</label>
            <div class="type-options">
              <label class="type-option" [class.selected]="form.get('role')?.value === 'USER'">
                <input type="radio" formControlName="role" value="USER"/>
                <mat-icon>person</mat-icon>
                <span>User</span>
              </label>
              <label class="type-option" [class.selected]="form.get('role')?.value === 'ADMIN'">
                <input type="radio" formControlName="role" value="ADMIN"/>
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Admin</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading">
            <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
            <span *ngIf="!isLoading">Create Account</span>
          </button>
        </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/login" class="link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notif: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER']
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.authService.register(this.form.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.notif.success(res.message || 'Account created! Check your email for your temporary password.');
          setTimeout(() => this.router.navigate(['/login']), 2500);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.notif.error(err.error?.message || 'Registration failed.');
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
