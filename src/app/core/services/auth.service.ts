import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, MessageResponse, SignUpRequest, User } from '../models/user.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = `${environment.apiURL}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());

    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/loginUser`, request).pipe(
            tap(res => this.handleAuthSuccess(res))
        );
    }

    register(request: SignUpRequest): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(`${this.baseUrl}/registerUser`, request);
    }

    forgotPassword(email: string): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(`${this.baseUrl}/forgotPassword`, { email });
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('access_token');
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    updateCurrentUser(user: User): void {
        const current = this.getUserFromLocalStorage();
        const updated = { ...current, ...user };
        localStorage.setItem('current_user', JSON.stringify(updated));
        this.currentUserSubject.next(updated);
    }

    updateSession(user: User, accessToken?: string): void {
        if (accessToken) {
            localStorage.setItem('access_token', accessToken);
        }
        this.updateCurrentUser(user);
    }

    private handleAuthSuccess(res: AuthResponse): void {
        localStorage.setItem('access_token', res.accessToken);
        if (res.refreshToken) {
            localStorage.setItem('refresh_token', res.refreshToken);
        }
        const user: User = {
            id: res.id,
            name: res.name,
            email: res.email,
            role: res.role as 'USER' | 'ADMIN',
            createdAt: res.createdAt
        };
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    private getUserFromLocalStorage(): User | null {
        const userStr = localStorage.getItem('current_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}
