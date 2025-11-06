// service层：只关心http请求，不关心业务逻辑
import { api } from "@/api";
import type { ServiceListResponse } from "./types";

const prefix = "/v1/service";

// 获取当前登录用户的所有最新版本服务列表
export const GetMyNewestServices = async () => {
    return api.get<ServiceListResponse>(`${prefix}/getHisNewestServicesByOwnerId`);
};