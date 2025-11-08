import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
import LoginForm from "@/components/User/LoginForm";
import ModifyPasswordForm from "@/components/User/ModifyPasswordForm";
import RegisterForm from "@/components/User/RegisterForm";
import { Message, CModal } from "@cloud-materials/common";
import { t } from "i18next";

const TOKEN_KEY = "cam_access_token";
const USER_STORE_KEY = "user-store";
const USER_STORE_TTL_KEY = "user-store-ttl";
const USER_STORE_TTL = 60 * 60 * 1000; // 1小时

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
    openLoginModal: () => void;
    openRegisterModal: () => void;
    openModifyPasswordModal: () => void;
}

export const useUser = create<UserStore>()(
    persist(
        (set, get) => {
            // useUser 初始化
            let token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                sessionStorage.removeItem(USER_STORE_KEY);
            }
            // 检查user-store是否过期
            const ttl = sessionStorage.getItem(USER_STORE_TTL_KEY);
            if (ttl && Number(ttl) < Date.now()) {
                sessionStorage.removeItem(USER_STORE_KEY);
            }
            return {
                user: null,
                loading: false,

                fetchUser: async () => {
                    // 无 token 时不触发请求
                    if (!token) {
                        return;
                    }
                    // 如果已经有数据且不在加载中，直接返回
                    if (get().user && !get().loading) {
                        return;
                    }
                    set({ loading: true });

                    try {
                        const res = await GetMyInfo();
                        if (res.status !== 200) {
                            Message.warning(res.message || "获取用户信息失败");
                            set({ loading: false, user: null });
                            localStorage.removeItem(TOKEN_KEY);
                            sessionStorage.removeItem(USER_STORE_KEY);
                            return;
                        }
                        set({
                            user: res.user || null,
                            loading: false,
                        });
                        // 设定TTL为1小时
                        sessionStorage.setItem(
                            USER_STORE_TTL_KEY,
                            String(Date.now() + USER_STORE_TTL)
                        );
                    } catch (error) {
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
                    token = res.access_token || "";
                    localStorage.setItem(TOKEN_KEY, token);
                    await get().fetchUser();
                    return res;
                },

                logout: () => {
                    localStorage.removeItem(TOKEN_KEY);
                    sessionStorage.removeItem(USER_STORE_KEY);
                    token = "";
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
                    formData: ModifyPasswordRequest & {
                        confirm_new_password: string;
                    }
                ) => {
                    if (
                        formData.new_password !== formData.confirm_new_password
                    ) {
                        throw new Error("两次新密码输入不一致");
                    }
                    const res = await UserModifyPassword(formData);
                    if (res.status !== 200) {
                        throw new Error(res.message || "修改密码失败");
                    }
                    return res;
                },

                openLoginModal: () => {
                    const modal = CModal.openArcoForm({
                        title: t("login.title"),
                        content: <LoginForm />,
                        cancelText: t("common.cancel"),
                        okText: t("login.login"),
                        onOk: async (values, form) => {
                            try {
                                await form.validate();
                                const res = await get().login({
                                    username: values.username,
                                    password: values.password,
                                });
                                Message.success(
                                    res.message || t("login.success")
                                );
                                // 显式关闭弹窗，避免依赖隐式行为
                                modal.close();
                            } catch (err: unknown) {
                                const msg =
                                    err instanceof Error
                                        ? err.message
                                        : t("login.failure");
                                Message.error(msg);
                                // 抛出错误以阻止弹窗自动关闭（库内有相关处理）
                                throw err;
                            }
                        },
                    });
                },

                openRegisterModal: () => {
                    const modal = CModal.openArcoForm({
                        title: t("register.title"),
                        content: <RegisterForm />,
                        cancelText: t("common.cancel"),
                        okText: t("register.submit"),
                        onOk: async (values, form) => {
                            try {
                                await form.validate();
                                const res = await get().register({
                                    username: values.username,
                                    password: values.password,
                                    nickname: values.nickname,
                                    email: values.email,
                                    role: values.role,
                                    confirmPassword: values.confirmPassword,
                                });
                                Message.success(
                                    res.message || t("register.success")
                                );
                                // 显式关闭弹窗，避免依赖隐式行为
                                modal.close();
                            } catch (err: unknown) {
                                const msg =
                                    err instanceof Error
                                        ? err.message
                                        : t("register.failure");
                                Message.error(msg);
                                // 抛出错误以阻止弹窗自动关闭（库内有相关处理）
                                throw err;
                            }
                        },
                    });
                },

                openModifyPasswordModal: () => {
                    const modal = CModal.openArcoForm({
                        title: t("modifyPassword.title"),
                        content: <ModifyPasswordForm />,
                        cancelText: t("common.cancel"),
                        okText: t("modifyPassword.submit"),
                        onOk: async (values, form) => {
                            try {
                                await form.validate();
                                const res = await get().modifyPassword({
                                    old_password: values.old_password,
                                    new_password: values.new_password,
                                    confirm_new_password:
                                        values.confirm_new_password,
                                });
                                Message.success(
                                    res.message || t("modifyPassword.success")
                                );
                                // 显式关闭弹窗，避免依赖隐式行为
                                modal.close();
                            } catch (err: unknown) {
                                const msg =
                                    err instanceof Error
                                        ? err.message
                                        : t("modifyPassword.failure");
                                Message.error(msg);
                                // 抛出错误以阻止弹窗自动关闭（库内有相关处理）
                                throw err;
                            }
                        },
                    });
                },
            };
        },
        {
            name: USER_STORE_KEY,
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({ user: state.user }),
        }
    )
);
