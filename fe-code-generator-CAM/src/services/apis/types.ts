export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    status: number;
    message: string;
    access_token: string;
}

export interface UserResponse {
    status: number;
    message: string;
    user: UserProfile;
}

export interface UserProfile {
    id: number;
    username: string;
    nickname: string;
    email: string;
    role: string;
    level: number;
    created_at: string;
}
