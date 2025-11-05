export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    access_token: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    nickname: string;
    email: string;
    role: string;
}

export interface RegisterResponse {
    message: string;
}

export interface UserProfile {
    id: number;
    username: string;
    nickname: string;
    email: string;
    role: string;
    level: string;
    created_at: string;
}
