import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { PlaylistService } from '../../core/services/playlist.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { PlaylistResponse } from '../../core/models/playlist.models';
import { CreatePlaylistDialogComponent } from './create-playlist-dialog/create-playlist-dialog.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.css'
})
export class PlaylistsComponent implements OnInit {
  playlists: PlaylistResponse[] = [];
  isLoading = true;

  searchQuery = '';
  searchTimeout: any;
  page = 0;
  pageSize = 12;
  totalPages = 0;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService,
    private notif: NotificationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadPlaylists(); }

  loadPlaylists(): void {
    this.isLoading = true;
    this.playlistService.getAllPublicPlaylists(this.page, this.pageSize, this.searchQuery || undefined).subscribe({
      next: res => { this.playlists = res.content; this.totalPages = res.totalPages; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => { this.page = 0; this.loadPlaylists(); }, 400);
  }

  openCreate(): void {
    const ref = this.dialog.open(CreatePlaylistDialogComponent, { panelClass: 'custom-dialog-container', width: '520px' });
    ref.afterClosed().subscribe(result => { if (result) { this.notif.success('Playlist created!'); this.loadPlaylists(); } });
  }

  viewPlaylist(id: number): void { this.router.navigate(['/app/playlists', id]); }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadPlaylists(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadPlaylists(); } }
}
