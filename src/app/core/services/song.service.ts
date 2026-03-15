import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SongResponse, PaginatedResponse } from '../models/song.models';

@Injectable({ providedIn: 'root' })
export class SongService {
  private baseUrl = `${environment.apiURL}`;

  constructor(private http: HttpClient) {}

  getAllSongs(
    page = 0,
    size = 12,
    search?: string,
    userId?: number
  ): Observable<PaginatedResponse<SongResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);
    if (userId) params = params.set('userId', userId.toString());
    return this.http.get<PaginatedResponse<SongResponse>>(`${this.baseUrl}/admin/get-all-songs`, { params });
  }

  addSong(formData: FormData): Observable<SongResponse> {
    return this.http.post<SongResponse>(`${this.baseUrl}/admin/add-song`, formData);
  }

  updateSong(id: number, formData: FormData): Observable<SongResponse> {
    return this.http.put<SongResponse>(`${this.baseUrl}/admin/update-song/${id}`, formData);
  }

  deleteSong(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/delete-song/${id}`);
  }

  getSongAIInsights(songId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/song/get-song-ai-insights/${songId}`);
  }
}
