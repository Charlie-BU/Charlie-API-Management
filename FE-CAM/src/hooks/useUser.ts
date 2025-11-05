import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UserProfile,
} from "@/services/user/types";
import { GetMyInfo, UserLogin, UserRegister } from "@/services/user";
import { Message } from "@cloud-materials/common";

const TOKEN_KEY = "cam_access_token";

// 将中文角色映射到后端期望的小写枚举值
const roleValueMap = {
    前端开发: "frontend",
    后端开发: "backend",
    全栈开发: "fullstack",
    测试工程师: "qa",
    运维工程师: "devops",
    产品经理: "product_manager",
    设计师: "designer",
    系统架构师: "architect",
    项目负责人: "proj_lead",
    访客: "guest",
} as const;

interface RegisterForm extends RegisterRequest {
    confirmPassword: string;
}

interface UserStore {
    user: UserProfile | null;
    loading: boolean;
    fetchUser: () => Promise<void>;
    login: (formData: LoginRequest) => Promise<LoginResponse>;
    logout: () => void;
    register: (formData: RegisterForm) => Promise<RegisterResponse>;
}

export const useUser = create<UserStore>()(
    persist(
        (set, get) => ({
            user: null,
            loading: false,

            fetchUser: async () => {
                // 如果已经有数据且不在加载中，直接返回
                if (get().user && !get().loading) {
                    return;
                }

                set({ loading: true });

                try {
                    const result = await GetMyInfo();
                    console.log("result", result);
                    set({
                        user: result || null,
                        loading: false,
                    });
                } catch (error) {
                    Message.warning("请登录");
                    set({ loading: false });
                }
            },

            login: async (formData: LoginRequest) => {
                const res = await UserLogin(formData);
                if (res.access_token) {
                    localStorage.setItem(TOKEN_KEY, res.access_token);
                    await get().fetchUser();
                }
                return res;
            },

            logout: () => {
                localStorage.removeItem(TOKEN_KEY);
                set({ user: null });
            },

            register: async (formData: RegisterForm) => {
                if (
                    !formData.username ||
                    !formData.password ||
                    !formData.nickname ||
                    !formData.email ||
                    !formData.role ||
                    !formData.confirmPassword
                ) {
                    throw new Error("请填写完整信息");
                }
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("两次密码输入不一致");
                }
                if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                    throw new Error("用户名只能包含字母、数字和下划线");
                }
                if (
                    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                        formData.email
                    )
                ) {
                    throw new Error("请输入正确的邮箱格式");
                }

                const roleValue =
                    roleValueMap[formData.role as keyof typeof roleValueMap];
                if (!roleValue) {
                    throw new Error("请选择正确的角色");
                }

                const registerRequest: RegisterRequest = {
                    username: formData.username,
                    password: formData.password,
                    nickname: formData.nickname,
                    email: formData.email,
                    role: roleValue,
                };

                return await UserRegister(registerRequest);
            }
        }),
        {
            name: "user-store",
            storage: createJSONStorage(() => sessionStorage),
            // 不持久化user数据
            // partialize: (state) => ({ user: state.user }),
        }
    )
);
