export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    status: number;
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
    status: number;
    message: string;
}

export interface ModifyPasswordRequest {
    old_password: string;
    new_password: string;
}

export interface ModifyPasswordResponse {
    status: number;
    message: string;
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
    level: string;
    created_at: string;
}
