import axios, { AxiosHeaders } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:1024";

const getAccessToken = (): string => {
    try {
        return localStorage.getItem("cam_access_token") || "";
    } catch {
        return "";
    }
};

export class ApiError extends Error {
    status?: number;
    data?: unknown;
    constructor(message: string, status?: number, data?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

export const http: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 请求拦截器：自动附加 Bearer Token
http.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            const headers = AxiosHeaders.from(config.headers);
            headers.set("Authorization", `Bearer ${token}`);
            config.headers = headers;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器：统一错误格式
http.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data;
        const message =
            data?.description ||
            data?.message ||
            error.message ||
            "Request error";
        return Promise.reject(new ApiError(message, status, data));
    }
);

// 封装常用请求方法（返回 data）
const get = async <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig
): Promise<T> => {
    const res = await http.get<T>(url, { ...config, params });
    return res.data as T;
};

const post = async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> => {
    const res = await http.post<T>(url, data, config);
    return res.data as T;
};

const put = async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> => {
    const res = await http.put<T>(url, data, config);
    return res.data as T;
};

const del = async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> => {
    const res = await http.delete<T>(url, config);
    return res.data as T;
};

const patch = async <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> => {
    const res = await http.patch<T>(url, data, config);
    return res.data as T;
};

export const api = {
    get,
    post,
    put,
    del,
    patch,
};

export type { AxiosRequestConfig };
