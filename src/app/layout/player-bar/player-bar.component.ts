import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { trigger, transition, style, animate } from '@angular/animations';
import { PlayerService, PlayerSong } from '../../core/services/player.service';
import { SongService } from '../../core/services/song.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSliderModule, MatProgressSpinnerModule],
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('0.25s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ transform: 'translateY(10px)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <!-- AI Insights Panel (above player bar) -->
    <div class="insights-panel" *ngIf="showInsights" [@slideUp]>
      <div class="insights-header">
        <span class="insights-title">✨ AI Insights</span>
        <span class="insights-song" *ngIf="currentSong">{{ currentSong.title }} · {{ currentSong.artist }}</span>
        <button class="insights-close" (click)="toggleInsights()">✕</button>
      </div>
      <div class="insights-body">
        <div *ngIf="loadingInsights" class="insights-loading">
          <div class="shimmer-line"></div>
          <div class="shimmer-line short"></div>
          <div class="shimmer-line"></div>
          <div class="shimmer-line short"></div>
        </div>
        <div *ngIf="!loadingInsights && insights" class="insights-content">
          <div class="insight-chip" *ngIf="insights.genre"><mat-icon>music_note</mat-icon>{{ insights.genre }}</div>
          <div class="insight-chip" *ngIf="insights.mood"><mat-icon>mood</mat-icon>{{ insights.mood }}</div>
          <div class="insight-chip" *ngIf="insights.tempo"><mat-icon>speed</mat-icon>{{ insights.tempo }}</div>
          <div class="insight-text" *ngIf="insights.description">{{ insights.description }}</div>
          <div *ngIf="insights.similarArtists?.length" class="insight-section">
            <span class="insight-label">Similar Artists</span>
            <div class="insight-tags">
              <span class="tag" *ngFor="let a of insights.similarArtists">{{ a }}</span>
            </div>
          </div>
          <div *ngIf="insights.funFact" class="insight-funfact">
            <mat-icon>lightbulb</mat-icon>
            <span>{{ insights.funFact }}</span>
          </div>
        </div>
        <div *ngIf="!loadingInsights && insightsError" class="insights-error">{{ insightsError }}</div>
      </div>
    </div>

    <div class="player-bar" [class.has-song]="currentSong">
      <!-- Song Info -->
      <div class="song-info">
        <ng-container *ngIf="currentSong; else noSong">
          <img [src]="currentSong.imageUrl || 'assets/default-cover.png'" class="cover-art"
               onerror="this.src='https://via.placeholder.com/56x56/282828/1DB954?text=♪'"/>
          <div class="song-meta">
            <span class="song-title">{{ currentSong.title }}</span>
            <span class="song-artist">{{ currentSong.artist }}</span>
          </div>
        </ng-container>
        <ng-template #noSong>
          <div class="no-song-placeholder">
            <mat-icon>music_note</mat-icon>
            <span>Select a song to play</span>
          </div>
        </ng-template>
      </div>

      <!-- Controls -->
      <div class="controls">
        <button class="ctrl-btn" (click)="prev()" [disabled]="!currentSong">
          <mat-icon>skip_previous</mat-icon>
        </button>
        <button class="play-btn" (click)="togglePlay()" [disabled]="!currentSong">
          <mat-icon>{{ isPlaying ? 'pause_circle_filled' : 'play_circle_filled' }}</mat-icon>
        </button>
        <button class="ctrl-btn" (click)="next()" [disabled]="!currentSong">
          <mat-icon>skip_next</mat-icon>
        </button>
      </div>

      <!-- Volume + AI Insights -->
      <div class="volume-section">
        <mat-icon class="vol-icon">volume_up</mat-icon>
        <input type="range" min="0" max="1" step="0.05" [value]="volume"
               (input)="setVolume($event)" class="vol-slider"/>
        <button class="insights-btn" (click)="toggleInsights()" [disabled]="!currentSong"
                [class.active]="showInsights" title="AI Insights">
          ✨
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }

    /* ── AI Insights Panel ─── */
    .insights-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      left: 0;
      background: rgba(18, 18, 18, 0.96);
      backdrop-filter: blur(24px);
      border-top: 1px solid #282828;
      border-bottom: 1px solid #282828;
      padding: 20px 28px;
      animation: slideUp 0.25s ease;
      z-index: 100;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    .insights-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .insights-title { font-weight: 700; font-size: 15px; color: #fff; }
    .insights-song { color: #b3b3b3; font-size: 13px; flex: 1; }
    .insights-close {
      background: transparent; border: none; color: #6a6a6a;
      font-size: 16px; cursor: pointer; padding: 4px 8px;
    }
    .insights-close:hover { color: #fff; }
    .insights-body { min-height: 80px; }
    .shimmer-line {
      height: 14px; border-radius: 8px;
      background: linear-gradient(90deg, #282828 25%, #333 50%, #282828 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      margin-bottom: 10px;
    }
    .shimmer-line.short { width: 60%; }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .insights-content { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; }
    .insight-chip {
      display: flex; align-items: center; gap: 6px;
      background: rgba(29,185,84,0.12); border: 1px solid rgba(29,185,84,0.3);
      color: #1DB954; border-radius: 500px; padding: 6px 14px;
      font-size: 13px; font-weight: 600;
    }
    .insight-chip mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .insight-text {
      width: 100%; color: #ccc; font-size: 14px; line-height: 1.6;
    }
    .insight-section { width: 100%; }
    .insight-label { font-size: 11px; color: #6a6a6a; text-transform: uppercase; letter-spacing: 1px; }
    .insight-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .tag {
      background: #282828; color: #ccc; border-radius: 4px;
      padding: 4px 12px; font-size: 12px;
    }
    .insight-funfact {
      display: flex; align-items: flex-start; gap: 10px;
      background: rgba(255,255,255,0.04); border-radius: 10px;
      padding: 12px 16px; width: 100%; color: #ccc; font-size: 13px;
    }
    .insight-funfact mat-icon { color: #f5a623; flex-shrink: 0; }
    .insights-error { color: #e74c3c; font-size: 13px; }

    /* ── Player Bar ─── */
    .player-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #181818;
      border-top: 1px solid #282828;
      padding: 0 24px;
      height: 80px;
      position: relative;
    }
    .song-info { display: flex; align-items: center; gap: 14px; width: 30%; min-width: 180px; }
    .cover-art { width: 56px; height: 56px; border-radius: 4px; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
    .song-meta { display: flex; flex-direction: column; gap: 2px; }
    .song-title { color: #fff; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
    .song-artist { color: #b3b3b3; font-size: 12px; }
    .no-song-placeholder { display: flex; align-items: center; gap: 8px; color: #6a6a6a; font-size: 13px; }
    .controls { display: flex; align-items: center; gap: 12px; }
    .ctrl-btn {
      background: transparent; color: #b3b3b3; border: none; border-radius: 50%;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      transition: color 0.15s, transform 0.1s; cursor: pointer;
    }
    .ctrl-btn:hover:not(:disabled) { color: #fff; transform: scale(1.1); }
    .ctrl-btn:disabled { opacity: 0.3; cursor: default; }
    .play-btn {
      background: transparent; border: none; color: #fff; cursor: pointer;
      width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s;
    }
    .play-btn mat-icon { font-size: 48px; width: 48px; height: 48px; color: #fff; }
    .play-btn:hover:not(:disabled) { transform: scale(1.08); }
    .play-btn:disabled { opacity: 0.3; cursor: default; }
    .volume-section {
      display: flex; align-items: center; gap: 10px;
      width: 30%; justify-content: flex-end;
    }
    .vol-icon { color: #b3b3b3; font-size: 20px; }
    .vol-slider {
      -webkit-appearance: none; width: 100px; height: 4px;
      border-radius: 4px; background: #535353; outline: none; cursor: pointer;
    }
    .vol-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 12px; height: 12px;
      border-radius: 50%; background: #fff; cursor: pointer;
    }
    .vol-slider:hover::-webkit-slider-thumb { background: #1DB954; }
    .insights-btn {
      background: transparent; border: none; font-size: 20px; cursor: pointer;
      padding: 6px; border-radius: 50%; line-height: 1;
      transition: transform 0.2s, filter 0.2s;
      opacity: 0.6;
    }
    .insights-btn:hover:not(:disabled) { transform: scale(1.2); opacity: 1; }
    .insights-btn.active { opacity: 1; filter: drop-shadow(0 0 8px #1DB954); transform: scale(1.1); }
    .insights-btn:disabled { opacity: 0.2; cursor: default; }
  `]
})
export class PlayerBarComponent implements OnInit, OnDestroy {
  currentSong: PlayerSong | null = null;
  isPlaying = false;
  volume = 0.8;

  showInsights = false;
  loadingInsights = false;
  insights: any = null;
  insightsError: string | null = null;
  private lastInsightSongId: number | null = null;

  private subs: Subscription[] = [];

  constructor(
    private player: PlayerService,
    private songService: SongService
  ) {}

  ngOnInit(): void {
    this.subs.push(this.player.currentSong$.subscribe(s => {
      this.currentSong = s;
      // Reset insights when song changes
      if (s?.id !== this.lastInsightSongId) {
        this.insights = null;
        this.insightsError = null;
      }
    }));
    this.subs.push(this.player.isPlaying$.subscribe(p => this.isPlaying = p));
  }

  toggleInsights(): void {
    if (!this.currentSong) return;
    this.showInsights = !this.showInsights;
    if (this.showInsights && !this.insights && !this.loadingInsights) {
      this.fetchInsights();
    }
  }

  fetchInsights(): void {
    if (!this.currentSong?.id) return;
    this.loadingInsights = true;
    this.insightsError = null;
    this.lastInsightSongId = this.currentSong.id;
    this.songService.getSongAIInsights(this.currentSong.id).subscribe({
      next: data => {
        this.insights = data;
        this.loadingInsights = false;
      },
      error: err => {
        this.insightsError = err.error?.message || 'Could not load AI insights for this song.';
        this.loadingInsights = false;
      }
    });
  }

  togglePlay(): void { this.player.togglePlayPause(); }
  prev(): void { this.player.playPrev(); }
  next(): void { this.player.playNext(); }
  setVolume(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.volume = val;
    this.player.setVolume(val);
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
