import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PlaylistService } from '../../core/services/playlist.service';
import { SongService } from '../../core/services/song.service';
import { PlayerService } from '../../core/services/player.service';
import { AuthService } from '../../core/services/auth.service';
import { PlaylistResponse } from '../../core/models/playlist.models';
import { SongResponse } from '../../core/models/song.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  playlists: PlaylistResponse[] = [];
  songs: SongResponse[] = [];
  greeting = '';
  isAdmin = false;
  loadingPlaylists = true;
  loadingSongs = true;

  constructor(
    private playlistService: PlaylistService,
    private songService: SongService,
    private playerService: PlayerService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'ADMIN';

    this.playlistService.getAllPublicPlaylists(0, 8).subscribe({
      next: res => { 
        this.ngZone.run(() => {
          this.playlists = res.content; 
          this.loadingPlaylists = false;
          this.cdr.detectChanges();
        });
      },
      error: () => this.ngZone.run(() => { this.loadingPlaylists = false; this.cdr.detectChanges(); })
    });
    this.songService.getAllSongs(0, 8).subscribe({
      next: res => { 
        this.ngZone.run(() => {
          this.songs = res.content; 
          this.loadingSongs = false;
          this.cdr.detectChanges();
        });
      },
      error: () => this.ngZone.run(() => { this.loadingSongs = false; this.cdr.detectChanges(); })
    });
  }

  playSong(song: SongResponse): void {
    const queue = this.songs.map(s => this.playerService.fromSongResponse(s));
    this.playerService.playSong(this.playerService.fromSongResponse(song), queue);
  }
}
