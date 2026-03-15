import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { PlaylistService } from '../../../core/services/playlist.service';
import { SongService } from '../../../core/services/song.service';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PlaylistWithSongsResponse, SongInPlaylist } from '../../../core/models/playlist.models';
import { SongResponse } from '../../../core/models/song.models';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, FormsModule, MatDialogModule],
  templateUrl: './playlist-detail.component.html',
  styleUrl: './playlist-detail.component.css'
})
export class PlaylistDetailComponent implements OnInit {
  playlist: PlaylistWithSongsResponse | null = null;
  isLoading = true;
  isOwner = false;
  currentSongId: number | null = null;

  // Add song search
  showAddSong = false;
  allSongs: SongResponse[] = [];
  songSearch = '';
  filteredSongs: SongResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playlistService: PlaylistService,
    private songService: SongService,
    private playerService: PlayerService,
    private authService: AuthService,
    private notif: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlaylist(id);
    this.playerService.currentSong$.subscribe(s => this.currentSongId = s?.id ?? null);
  }

  loadPlaylist(id: number): void {
    this.isLoading = true;
    this.playlistService.getPlaylistWithSongs(id).subscribe({
      next: p => {
        this.playlist = p;
        const user = this.authService.getCurrentUser();
        this.isOwner = user?.id === p.appUserId || user?.role === 'ADMIN';
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; this.router.navigate(['/app/playlists']); }
    });
  }

  playAll(): void {
    if (!this.playlist?.songs?.length) return;
    const queue = this.playlist.songs.map(s => this.playerService.fromPlaylistSong(s));
    this.playerService.playSong(queue[0], queue);
  }

  playSong(s: SongInPlaylist): void {
    const queue = (this.playlist?.songs || []).map(x => this.playerService.fromPlaylistSong(x));
    this.playerService.playSong(this.playerService.fromPlaylistSong(s), queue);
  }

  removeSong(songId: number): void {
    if (!this.playlist) return;
    this.playlistService.removeSongFromPlaylist(this.playlist.id, songId).subscribe({
      next: () => { this.notif.success('Song removed'); this.loadPlaylist(this.playlist!.id); },
      error: () => this.notif.error('Failed to remove song')
    });
  }

  openAddSong(): void {
    this.showAddSong = true;
    this.songService.getAllSongs(0, 50).subscribe(res => {
      this.allSongs = res.content;
      this.filteredSongs = res.content;
    });
  }

  filterSongs(): void {
    const q = this.songSearch.toLowerCase();
    this.filteredSongs = this.allSongs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  }

  addSong(songId: number): void {
    if (!this.playlist) return;
    this.playlistService.addSongToPlaylist(this.playlist.id, songId).subscribe({
      next: () => { this.notif.success('Song added!'); this.loadPlaylist(this.playlist!.id); this.showAddSong = false; },
      error: (err) => this.notif.error(err.error?.message || 'Failed to add song')
    });
  }

  deletePlaylist(): void {
    if (!this.playlist || !confirm('Delete this playlist?')) return;
    this.playlistService.deletePlaylist(this.playlist.id).subscribe({
      next: () => { this.notif.success('Playlist deleted'); this.router.navigate(['/app/playlists']); },
      error: () => this.notif.error('Delete failed')
    });
  }
}
