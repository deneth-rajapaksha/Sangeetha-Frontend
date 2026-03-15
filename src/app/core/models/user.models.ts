export interface User {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignUpRequest {
    name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    id: number;
    name: string;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    createdAt?: string;
}

export interface MessageResponse {
    message: string;
}

export interface AppUserResponse {
    id: number;
    name: string;
    email: string;
    role: string;
    accessToken?: string;
    refreshToken?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
    oldPassword?: string;
    role?: string;
    refreshToken?: string;
}
