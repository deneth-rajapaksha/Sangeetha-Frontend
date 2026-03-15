import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlaylistService } from '../../../core/services/playlist.service';

@Component({
  selector: 'app-create-playlist-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatProgressSpinnerModule],
  template: `
    <div class="dialog">
      <h2 class="dialog-title">🎧 Create Playlist</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dialog-form">
        <mat-form-field appearance="fill" class="field">
          <mat-label>Playlist Name</mat-label>
          <input matInput formControlName="name" placeholder="My awesome playlist"/>
          <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="field">
          <mat-label>Description (optional)</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="What's this playlist about?"></textarea>
        </mat-form-field>

        <div class="file-picker">
          <label class="file-label">Cover Image</label>
          <div class="file-drop" (click)="imgInput.click()" [class.has-file]="imageFile">
            <mat-icon>image</mat-icon>
            <span>{{ imageFile ? imageFile.name : 'Click to select cover image' }}</span>
          </div>
          <input #imgInput type="file" accept="image/*" hidden (change)="onImageSelected($event)"/>
        </div>

        <div class="toggle-row">
          <span class="toggle-label">Make public</span>
          <mat-slide-toggle formControlName="isPublic" color="primary"></mat-slide-toggle>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn-cancel" mat-dialog-close>Cancel</button>
          <button type="submit" class="btn-create" [disabled]="isLoading || !form.valid || !imageFile">
            <mat-spinner *ngIf="isLoading" diameter="18"></mat-spinner>
            <span *ngIf="!isLoading">Create Playlist</span>
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
    .file-drop:hover, .file-drop.has-file { border-color: #1DB954; color: #1DB954; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; }
    .toggle-label { color: #b3b3b3; font-size: 14px; font-weight: 600; }
    ::ng-deep .mat-mdc-slide-toggle .mdc-switch:enabled .mdc-switch__track::after { background: #1DB954 !important; }
    ::ng-deep .mat-mdc-slide-toggle.mat-checked .mdc-switch__handle { background: #1DB954 !important; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .btn-cancel { background: transparent; border: 1px solid #535353; color: #b3b3b3; padding: 10px 20px; border-radius: 500px; cursor: pointer; font-weight: 600; }
    .btn-cancel:hover { border-color: #fff; color: #fff; }
    .btn-create { background: #1DB954; color: #000; border: none; padding: 10px 24px; border-radius: 500px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .btn-create:disabled { background: #535353; cursor: not-allowed; }
  `]
})
export class CreatePlaylistDialogComponent {
  form: FormGroup;
  imageFile: File | null = null;
  isLoading = false;

  constructor(private fb: FormBuilder, private playlistService: PlaylistService, private dialogRef: MatDialogRef<CreatePlaylistDialogComponent>) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      isPublic: [true]
    });
  }

  onImageSelected(e: Event): void { this.imageFile = (e.target as HTMLInputElement).files?.[0] || null; }

  onSubmit(): void {
    if (this.form.valid && this.imageFile) {
      const fd = new FormData();
      fd.append('name', this.form.value.name);
      if (this.form.value.description) fd.append('description', this.form.value.description);
      fd.append('isPublic', this.form.value.isPublic.toString());
      fd.append('imageFile', this.imageFile);
      this.isLoading = true;
      this.playlistService.createPlaylist(fd).subscribe({
        next: () => { this.isLoading = false; this.dialogRef.close(true); },
        error: () => { this.isLoading = false; }
      });
    }
  }
}
