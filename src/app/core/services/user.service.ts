import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUserResponse, UpdateUserRequest } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.apiURL}/app-user`;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<AppUserResponse> {
    return this.http.get<AppUserResponse>(`${this.baseUrl}/get-user-profile`);
  }

  updateUserProfile(request: UpdateUserRequest): Observable<AppUserResponse> {
    return this.http.put<AppUserResponse>(`${this.baseUrl}/update-user-profile`, request);
  }

  updateUserRole(userId: number, role: 'USER' | 'ADMIN'): Observable<AppUserResponse> {
    return this.http.patch<AppUserResponse>(`${this.baseUrl}/update-user-role/${userId}?role=${role}`, {});
  }
}
