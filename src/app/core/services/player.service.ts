import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SongResponse } from '../models/song.models';
import { SongInPlaylist } from '../models/playlist.models';

export type PlayerSong = {
  id: number;
  title: string;
  artist: string;
  songUrl: string;
  imageUrl: string;
};

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private currentSongSubject = new BehaviorSubject<PlayerSong | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private queueSubject = new BehaviorSubject<PlayerSong[]>([]);
  private queueIndexSubject = new BehaviorSubject<number>(0);

  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  queue$ = this.queueSubject.asObservable();

  private audio = new Audio();

  constructor() {
    this.audio.addEventListener('ended', () => this.playNext());
  }

  playSong(song: PlayerSong, queue?: PlayerSong[]): void {
    if (queue) {
      this.queueSubject.next(queue);
      const idx = queue.findIndex(s => s.id === song.id);
      this.queueIndexSubject.next(idx >= 0 ? idx : 0);
    }
    this.currentSongSubject.next(song);
    this.audio.src = song.songUrl;
    this.audio.load();
    this.audio.play().then(() => this.isPlayingSubject.next(true)).catch(() => {});
  }

  togglePlayPause(): void {
    if (this.audio.paused) {
      this.audio.play().then(() => this.isPlayingSubject.next(true)).catch(() => {});
    } else {
      this.audio.pause();
      this.isPlayingSubject.next(false);
    }
  }

  playNext(): void {
    const queue = this.queueSubject.value;
    let idx = this.queueIndexSubject.value + 1;
    if (idx < queue.length) {
      this.queueIndexSubject.next(idx);
      this.playSong(queue[idx]);
    }
  }

  playPrev(): void {
    const queue = this.queueSubject.value;
    let idx = this.queueIndexSubject.value - 1;
    if (idx >= 0) {
      this.queueIndexSubject.next(idx);
      this.playSong(queue[idx]);
    }
  }

  get audioRef(): HTMLAudioElement {
    return this.audio;
  }

  setVolume(vol: number): void {
    this.audio.volume = vol;
  }

  fromSongResponse(s: SongResponse): PlayerSong {
    return { id: s.id, title: s.title, artist: s.artist, songUrl: s.songUrl, imageUrl: s.imageUrl };
  }

  fromPlaylistSong(s: SongInPlaylist): PlayerSong {
    return { id: s.songId, title: s.title, artist: s.artist, songUrl: s.songUrl, imageUrl: s.imageUrl };
  }
}
