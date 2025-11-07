// service层：只关心http请求，不关心业务逻辑
import { api } from "@/api";
import type {
    LoginRequest,
    LoginResponse,
    ModifyPasswordRequest,
    ModifyPasswordResponse,
    RegisterRequest,
    RegisterResponse,
    UserResponse,
} from "./types";

const prefix = "/v1/user";

// 用户登录
export const UserLogin = async (data: LoginRequest) => {
    return api.post<LoginResponse>(`${prefix}/login`, data);
};

// 用户注册
export const UserRegister = async (data: RegisterRequest) => {
    return api.post<RegisterResponse>(`${prefix}/register`, data);
};

// 修改密码
export const UserModifyPassword = async (data: ModifyPasswordRequest) => {
    return api.post<ModifyPasswordResponse>(`${prefix}/modifyPassword`, data);
};

// 获取用户信息
export const GetUserById = async (id: number) => {
    return api.get<UserResponse>(`${prefix}/getUserById`, { id });
};

// 获取当前登录用户信息
export const GetMyInfo = async () => {
    return api.get<UserResponse>(`${prefix}/getMyInfo`);
};
