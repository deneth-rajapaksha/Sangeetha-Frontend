import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SongService } from '../../../core/services/song.service';

@Component({
  selector: 'app-upload-song-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="dialog">
      <h2 class="dialog-title">🎵 Upload New Song</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-form">
        <mat-form-field appearance="fill" class="field">
          <mat-label>Song Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter title"/>
          <mat-error *ngIf="form.get('title')?.hasError('required')">Title is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="field">
          <mat-label>Artist</mat-label>
          <input matInput formControlName="artist" placeholder="Artist name"/>
          <mat-error *ngIf="form.get('artist')?.hasError('required')">Artist is required</mat-error>
        </mat-form-field>

        <div class="file-picker">
          <label class="file-label">Song File (MP3, WAV)</label>
          <div class="file-drop" (click)="songInput.click()" [class.has-file]="songFile">
            <mat-icon>audio_file</mat-icon>
            <span>{{ songFile ? songFile.name : 'Click to select audio file' }}</span>
          </div>
          <input #songInput type="file" accept="audio/*" hidden (change)="onSongSelected($event)"/>
        </div>

        <div class="file-picker">
          <label class="file-label">Cover Image (JPG, PNG)</label>
          <div class="file-drop" (click)="imgInput.click()" [class.has-file]="imageFile">
            <mat-icon>image</mat-icon>
            <span>{{ imageFile ? imageFile.name : 'Click to select cover image' }}</span>
          </div>
          <input #imgInput type="file" accept="image/*" hidden (change)="onImageSelected($event)"/>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn-cancel" mat-dialog-close>Cancel</button>
          <button type="submit" class="btn-upload" [disabled]="isLoading || !form.valid || !songFile || !imageFile">
            <mat-spinner *ngIf="isLoading" diameter="18"></mat-spinner>
            <span *ngIf="!isLoading">Upload</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog { padding: 28px; background: #282828; border-radius: 12px; min-width: 460px; }
    .dialog-title { color: #fff; font-size: 22px; font-weight: 800; margin-bottom: 20px; }
    .dialog-form { display: flex; flex-direction: column; gap: 12px; }
    .field { width: 100%; }
    ::ng-deep .dialog .mat-mdc-text-field-wrapper { background: rgba(255,255,255,0.07) !important; }
    ::ng-deep .dialog .mat-mdc-input-element { color: #fff !important; }
    .file-label { color: #b3b3b3; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .file-drop {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px;
      border: 1.5px dashed #404040;
      border-radius: 8px;
      cursor: pointer;
      color: #6a6a6a;
      font-size: 13px;
      margin-top: 6px;
      transition: all 0.2s;
    }
    .file-drop:hover { border-color: #1DB954; color: #1DB954; }
    .file-drop.has-file { border-color: #1DB954; color: #1DB954; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .btn-cancel { background: transparent; border: 1px solid #535353; color: #b3b3b3; padding: 10px 20px; border-radius: 500px; cursor: pointer; font-weight: 600; }
    .btn-cancel:hover { border-color: #fff; color: #fff; }
    .btn-upload { background: #1DB954; color: #000; border: none; padding: 10px 24px; border-radius: 500px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .btn-upload:disabled { background: #535353; cursor: not-allowed; }
  `]
})
export class UploadSongDialogComponent {
  form: FormGroup;
  songFile: File | null = null;
  imageFile: File | null = null;
  isLoading = false;

  constructor(private fb: FormBuilder, private songService: SongService, private dialogRef: MatDialogRef<UploadSongDialogComponent>) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      artist: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  onSongSelected(e: Event): void { this.songFile = (e.target as HTMLInputElement).files?.[0] || null; }
  onImageSelected(e: Event): void { this.imageFile = (e.target as HTMLInputElement).files?.[0] || null; }

  onSubmit(): void {
    if (this.form.valid && this.songFile && this.imageFile) {
      const fd = new FormData();
      fd.append('title', this.form.value.title);
      fd.append('artist', this.form.value.artist);
      fd.append('songFile', this.songFile);
      fd.append('imageFile', this.imageFile);
      this.isLoading = true;
      this.songService.addSong(fd).subscribe({
        next: () => { this.isLoading = false; this.dialogRef.close(true); },
        error: () => { this.isLoading = false; }
      });
    }
  }
}
