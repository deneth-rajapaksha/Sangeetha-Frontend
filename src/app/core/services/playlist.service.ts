import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlaylistResponse, PlaylistWithSongsResponse, PaginatedResponse } from '../models/playlist.models';
import { MessageResponse } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private baseUrl = `${environment.apiURL}/play`;

  constructor(private http: HttpClient) {}

  createPlaylist(formData: FormData): Observable<PlaylistResponse> {
    return this.http.post<PlaylistResponse>(`${this.baseUrl}/create-playlist`, formData);
  }

  getAllPublicPlaylists(
    page = 0,
    size = 12,
    search?: string
  ): Observable<PaginatedResponse<PlaylistResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);
    return this.http.get<PaginatedResponse<PlaylistResponse>>(`${this.baseUrl}/get-all-public-playlists`, { params });
  }

  getPlaylistWithSongs(playlistId: number): Observable<PlaylistWithSongsResponse> {
    return this.http.get<PlaylistWithSongsResponse>(`${this.baseUrl}/get-playlist-with-song/${playlistId}`);
  }

  addSongToPlaylist(playlistId: number, songId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/add-song-to-playlist/${playlistId}?songId=${songId}`, {});
  }

  removeSongFromPlaylist(playlistId: number, songId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/remove-song-from-playlist/${playlistId}?songId=${songId}`);
  }

  reorderSong(playlistId: number, songId: number, newPosition: number): Observable<MessageResponse> {
    return this.http.patch<MessageResponse>(
      `${this.baseUrl}/reorder-song-in-playlist/${playlistId}?songId=${songId}&newPosition=${newPosition}`,
      {}
    );
  }

  updatePlaylistPrivacy(id: number, isPublic: boolean): Observable<PlaylistResponse> {
    return this.http.patch<PlaylistResponse>(`${this.baseUrl}/update-playlist-privacy/${id}?isPublic=${isPublic}`, {});
  }

  deletePlaylist(playlistId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.baseUrl}/delete-playlist/${playlistId}`);
  }
}
