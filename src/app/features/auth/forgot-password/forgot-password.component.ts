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
  selector: 'app-forgot-password',
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
        <div class="lock-icon-wrap">
          <mat-icon class="lock-icon">lock_reset</mat-icon>
        </div>
        <h1 class="auth-title">Reset password</h1>
        <p class="auth-subtitle">We'll email you a new temporary password</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="field-group">
            <label>Email address</label>
            <mat-form-field appearance="fill" class="field">
              <input matInput type="email" formControlName="email" placeholder="your@email.com"/>
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
              <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
            </mat-form-field>
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading || sent">
            <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
            <ng-container *ngIf="!isLoading">
              <mat-icon *ngIf="sent">check_circle</mat-icon>
              <span>{{ sent ? 'Email sent!' : 'Send reset email' }}</span>
            </ng-container>
          </button>
        </form>

        <p class="auth-footer">
          Remember your password?
          <a routerLink="/login" class="link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  form: FormGroup;
  isLoading = false;
  sent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notif: NotificationService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.authService.forgotPassword(this.form.value.email).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.sent = true;
          this.notif.success(res.message || 'If an account exists, a temporary password has been sent.');
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err: any) => {
          this.isLoading = false;
          this.notif.error(err.error?.message || 'Request failed.');
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
