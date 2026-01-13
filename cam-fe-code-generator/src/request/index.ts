import axios, { AxiosHeaders } from "axios";
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { TokenManager } from "../utils/data-manager";

const BASE_URL = "https://cam-api.com/api";
// const BASE_URL = "http://0.0.0.0:1024";

const getAccessToken = (): string => {
    const tokenManager = TokenManager.getInstance();
    return tokenManager.getToken() || "";
};

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
    (error: AxiosError) => {
        const message = error.message || "Request error";
        console.error("API Error:", message, error);
        return Promise.reject(message);
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
