import { create } from "zustand";

import type {
    LoginRequest,
    LoginResponse,
    ModifyPasswordRequest,
    ModifyPasswordResponse,
    RegisterRequest,
    RegisterResponse,
    UserProfile,
} from "@/services/user/types";
import {
    GetMyInfo,
    UserLogin,
    UserModifyPassword,
    UserRegister,
} from "@/services/user";
import { Message } from "@cloud-materials/common";

const TOKEN_KEY = "cam_access_token";

// 后端角色枚举值（用于注册时的有效性校验与传递）
const VALID_ROLES = [
    "frontend",
    "backend",
    "fullstack",
    "qa",
    "devops",
    "product_manager",
    "designer",
    "architect",
    "proj_lead",
    "guest",
] as const;
type RoleCode = (typeof VALID_ROLES)[number];

interface UserStore {
    user: UserProfile | null;
    loading: boolean;
    fetchUser: () => Promise<void>;
    login: (formData: LoginRequest) => Promise<LoginResponse>;
    logout: () => void;
    register: (
        formData: RegisterRequest & { confirmPassword: string }
    ) => Promise<RegisterResponse>;
    modifyPassword: (
        formData: ModifyPasswordRequest & { confirm_new_password: string }
    ) => Promise<ModifyPasswordResponse>;
}

export const useUser = create<UserStore>((set, get) => ({
    user: null,
    loading: false,

    // 注：角色的显示文案请在 UI 层使用 i18n：i18n.t(`user.${role}`)

    fetchUser: async () => {
        // 如果已经有数据且不在加载中，直接返回
        if (get().user && !get().loading) {
            return;
        }
        // 无 token 时不触发请求
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            return;
        }
        set({ loading: true });

        try {
            const res = await GetMyInfo();
            if (res.status !== 200) {
                Message.warning(res.message || "获取用户信息失败");
                set({ loading: false, user: null });
                localStorage.removeItem(TOKEN_KEY);
                return;
            }
            set({
                user: res.user || null,
                loading: false,
            });
        } catch (error) {
            // Message.warning("获取用户信息失败");
            set({ loading: false, user: null });
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    login: async (formData: LoginRequest) => {
        const res = await UserLogin(formData);
        if (res.status !== 200) {
            // Hook不出UI提示，失败抛错由组件处理
            throw new Error(res.message || "登录失败");
        }
        // 成功：写入令牌并恢复会话
        localStorage.setItem(TOKEN_KEY, res.access_token);
        await get().fetchUser();
        return res;
    },

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null });
    },

    register: async (
        formData: RegisterRequest & { confirmPassword: string }
    ) => {
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

        const roleCode = formData.role as RoleCode;
        if (!VALID_ROLES.includes(roleCode)) {
            throw new Error("请选择正确的角色");
        }

        const registerRequest: RegisterRequest = {
            username: formData.username,
            password: formData.password,
            nickname: formData.nickname,
            email: formData.email,
            role: roleCode,
        };

        const res = await UserRegister(registerRequest);
        if (res.status !== 200) {
            throw new Error(res.message || "注册失败");
        }
        return res;
    },

    modifyPassword: async (
        formData: ModifyPasswordRequest & { confirm_new_password: string }
    ) => {
        if (formData.new_password !== formData.confirm_new_password) {
            throw new Error("两次新密码输入不一致");
        }
        const res = await UserModifyPassword(formData);
        if (res.status !== 200) {
            throw new Error(res.message || "修改密码失败");
        }
        return res;
    },
}));
