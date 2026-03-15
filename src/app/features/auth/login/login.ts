import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SignUpRequest, LoginRequest } from '../../../core/models/user.models';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  currentView: 'login' | 'forgot-password' | 'signup' = 'login';
  loginForm!: FormGroup;
  signupForm!: FormGroup;
  forgotPasswordForm!: FormGroup;

  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app/home']);
    }
    this.initForms();
  }

  initForms() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER']
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  showView(view: 'login' | 'forgot-password' | 'signup') {
    if (view === 'signup' && this.loginForm.value.email) {
      this.signupForm.patchValue({ email: this.loginForm.value.email });
    } else if (view === 'login' && this.signupForm.value.email) {
      this.loginForm.patchValue({ email: this.signupForm.value.email });
    }
    this.currentView = view;
  }

  onLoginSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      const request: LoginRequest = this.loginForm.value;
      this.authService.login(request).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
            this.notificationService.success('Login successful!');
            this.router.navigate(['/app/home']);
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
            this.notificationService.error(err.error?.message || 'Login failed. Please check credentials.');
          });
        }
      });
    } else if (!this.isLoading) {
      this.loginForm.markAllAsTouched();
    }
  }

  onSignUpSubmit() {
    if (this.signupForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      const request: SignUpRequest = this.signupForm.value;
      this.authService.register(request).subscribe({
        next: (res: any) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
            this.notificationService.success(res.message || 'Registration successful. A temporary password has been sent to your email.');
            setTimeout(() => {
              this.showView('login');
            }, 3000);
          });
        },
        error: (err: any) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
            this.notificationService.error(err.error?.message || 'Registration failed.');
          });
        }
      });
    } else if (!this.isLoading) {
      this.signupForm.markAllAsTouched();
    }
  }

  onForgotSubmit() {
    if (this.forgotPasswordForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.cdr.detectChanges();
      
      const email = this.forgotPasswordForm.value.email;
      this.authService.forgotPassword(email).subscribe({
        next: (res: any) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
            this.notificationService.success(res.message || 'If an account exists, a new temporary password has been sent.');
            setTimeout(() => {
              this.showView('login');
            }, 3000);
          });
        },
        error: (err: any) => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
            this.notificationService.error(err.error?.message || 'Password reset request failed.');
          });
        }
      });
    } else if (!this.isLoading) {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
