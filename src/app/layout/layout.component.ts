import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PlayerBarComponent } from './player-bar/player-bar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, PlayerBarComponent],
  template: `
    <div class="app-shell">
      <app-sidebar class="sidebar"></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-player-bar class="player-bar"></app-player-bar>
    </div>
  `,
  styles: [`
    .app-shell {
      display: grid;
      grid-template-columns: 240px 1fr;
      grid-template-rows: 1fr 80px;
      grid-template-areas:
        "sidebar main"
        "player player";
      height: 100vh;
      overflow: hidden;
      background: #000;
    }
    app-sidebar { grid-area: sidebar; }
    .main-content {
      grid-area: main;
      overflow-y: auto;
      background: linear-gradient(180deg, #1a0a2e 0%, #121212 40%);
    }
    app-player-bar { grid-area: player; }
  `]
})
export class LayoutComponent {}
