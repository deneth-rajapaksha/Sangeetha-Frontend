import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SongService } from '../../core/services/song.service';
import { PlayerService } from '../../core/services/player.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { SongResponse } from '../../core/models/song.models';
import { UploadSongDialogComponent } from './upload-song-dialog/upload-song-dialog.component';

@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule],
  templateUrl: './songs.component.html',
  styleUrl: './songs.component.css'
})
export class SongsComponent implements OnInit, OnDestroy {
  songs: SongResponse[] = [];
  isLoading = true;
  isAdmin = false;
  currentSongId: number | null = null;

  searchQuery = '';
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  page = 0;
  pageSize = 12;
  totalPages = 0;

  constructor(
    private songService: SongService,
    private playerService: PlayerService,
    private authService: AuthService,
    private notif: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getCurrentUser()?.role === 'ADMIN';
    this.loadSongs();
    this.playerService.currentSong$.subscribe(s => this.currentSongId = s?.id ?? null);

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.searchQuery = query;
      this.page = 0;
      this.loadSongs(false); // don't show full-page loader on search
    });
  }

  loadSongs(showLoader = true): void {
    if (showLoader) this.isLoading = true;
    this.songService.getAllSongs(this.page, this.pageSize, this.searchQuery || undefined).subscribe({
      next: res => {
        this.songs = res.content;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  playSong(song: SongResponse): void {
    const queue = this.songs.map(s => this.playerService.fromSongResponse(s));
    this.playerService.playSong(this.playerService.fromSongResponse(song), queue);
  }

  openUpload(): void {
    const ref = this.dialog.open(UploadSongDialogComponent, { panelClass: 'custom-dialog-container', width: '500px' });
    ref.afterClosed().subscribe(res => { if (res) { this.notif.success('Song uploaded!'); this.loadSongs(); } });
  }

  deleteSong(id: number): void {
    if (confirm('Delete this song?')) {
      this.songService.deleteSong(id).subscribe({
        next: () => { this.notif.success('Song deleted'); this.loadSongs(); },
        error: () => this.notif.error('Delete failed')
      });
    }
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadSongs(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadSongs(); } }
  
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
