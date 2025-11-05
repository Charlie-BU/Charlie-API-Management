// service层：只关心http请求，不关心业务逻辑
import { api } from "@/api";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UserResponse,
} from "./types";

const prefix = "/v1/user";

export const UserLogin = async (data: LoginRequest) => {
    return api.post<LoginResponse>(`${prefix}/login`, data);
};

export const UserRegister = async (data: RegisterRequest) => {
    return api.post<RegisterResponse>(`${prefix}/register`, data);
};

export const GetUserById = async (id: number) => {
    return api.get<UserResponse>(`${prefix}/${id}`);
};

export const GetMyInfo = async () => {
    return api.get<UserResponse>(`${prefix}/getMyInfo`);
};
