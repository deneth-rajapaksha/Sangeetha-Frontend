import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="sidebar">
      <div class="sidebar-top">
        <div class="logo">
          <span class="logo-icon">🎵</span>
          <span class="logo-text">Sangeetha</span>
        </div>

        <ul class="nav-links">
          <li>
            <a routerLink="/app/home" routerLinkActive="active" class="nav-item">
              <mat-icon>home</mat-icon>
              <span>Home</span>
            </a>
          </li>
          <li>
            <a routerLink="/app/songs" routerLinkActive="active" class="nav-item">
              <mat-icon>library_music</mat-icon>
              <span>Songs</span>
            </a>
          </li>
          <li>
            <a routerLink="/app/playlists" routerLinkActive="active" class="nav-item">
              <mat-icon>queue_music</mat-icon>
              <span>Playlists</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-divider"></div>

        <div class="library-section">
          <div class="library-header">
            <mat-icon>library_music</mat-icon>
            <span>Your Library</span>
          </div>
          <p class="library-hint">Create your first playlist</p>
          <a routerLink="/app/playlists" class="btn-create">
            <mat-icon>add</mat-icon> New Playlist
          </a>
        </div>
      </div>

      <div class="sidebar-bottom">
        <a routerLink="/app/profile" routerLinkActive="active" class="nav-item profile-link">
          <mat-icon>account_circle</mat-icon>
          <span>{{ userName }}</span>
        </a>
        <button class="logout-btn" (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #000;
      height: 100%;
      padding: 16px 8px;
      overflow-y: auto;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px 24px;
    }
    .logo-icon { font-size: 28px; }
    .logo-text {
      font-size: 22px;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .nav-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 6px;
      color: #b3b3b3;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.15s ease;
      cursor: pointer;
    }
    .nav-item:hover, .nav-item.active {
      color: #fff;
      background: rgba(255,255,255,0.07);
    }
    .nav-item.active { color: #1DB954; }
    mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .sidebar-divider {
      height: 1px;
      background: #282828;
      margin: 16px 16px;
    }
    .library-section { padding: 0 8px; }
    .library-header {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #b3b3b3;
      font-weight: 700;
      font-size: 13px;
      padding: 8px 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .library-hint {
      color: #6a6a6a;
      font-size: 12px;
      padding: 4px 8px 12px;
    }
    .btn-create {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 500px;
      background: #282828;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s;
      margin: 0 8px;
    }
    .btn-create:hover { background: #383838; }
    .sidebar-bottom { border-top: 1px solid #282828; padding-top: 12px; }
    .profile-link { color: #b3b3b3; }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 6px;
      color: #b3b3b3;
      background: transparent;
      font-weight: 600;
      font-size: 14px;
      width: 100%;
      transition: all 0.15s ease;
    }
    .logout-btn:hover { color: #f44336; background: rgba(244,67,54,0.1); }
  `]
})
export class SidebarComponent {
  userName = '';

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name || 'Profile';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
