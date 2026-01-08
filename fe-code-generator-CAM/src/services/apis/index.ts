import { api } from "../../request";
import type { LoginRequest, LoginResponse, UserResponse } from "./types";

const prefix = "/v1/user";

// 用户登录
export const UserLogin = async (data: LoginRequest) => {
    return api.post<LoginResponse>(`${prefix}/login`, data);
};

// 获取当前登录用户信息
export const GetMyInfo = async () => {
    return api.get<UserResponse>(`${prefix}/getMyInfo`);
};
