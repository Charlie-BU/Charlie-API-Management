// service层：只关心http请求，不关心业务逻辑
import { api } from "@/request";
import type {
    GetAllCategoriesByServiceIdResponse,
    GetAllApisByServiceIdResponse,
    GetApiByIdResponse,
    AddCategoryByServiceIdRequest,
    AddCategoryByServiceIdResponse,
    DeleteCategoryByIdRequest,
    DeleteCategoryByIdResponse,
    UpdateCategoryByIdRequest,
    UpdateCategoryByIdResponse,
    UpdateApiCategoryByIdRequest,
    UpdateApiCategoryByIdResponse,
    AddApiRequest,
    AddApiResponse,
    DeleteApiByApiDraftIdRequest,
    DeleteApiByApiDraftIdResponse,
    UpdateApiByApiDraftIdRequest,
    UpdateApiByApiDraftIdResponse,
} from "./types";

const prefix = "/v1/api";

// 通过 service_id 获取全部 categories
export const GetAllCategoriesByServiceId = async (service_id: number) => {
    return api.get<GetAllCategoriesByServiceIdResponse>(
        `${prefix}/getAllCategoriesByServiceId`,
        { service_id }
    );
};

// 通过 service_id 获取全部 api（最新版本，不含 params；当前路由实现要求 category_id 同时提供）
export const GetAllApisByServiceId = async (
    service_id: number,
    category_id: number
) => {
    return api.get<GetAllApisByServiceIdResponse>(
        `${prefix}/getAllApisByServiceId`,
        { service_id, category_id }
    );
};

// 通过 api_id 获取 api 详情（包含 params）；is_latest 缺省为 true
export const GetApiById = async (api_id: number, is_latest?: boolean) => {
    const params: Record<string, unknown> = { api_id };
    if (is_latest !== undefined) params.is_latest = is_latest;
    return api.get<GetApiByIdResponse>(`${prefix}/getApiById`, params);
};

// 通过 service_id 新增 category
export const AddCategoryByServiceId = async (
    data: AddCategoryByServiceIdRequest
) => {
    return api.post<AddCategoryByServiceIdResponse>(
        `${prefix}/addCategoryByServiceId`,
        data
    );
};

// 通过 category_id 删除 category
export const DeleteCategoryById = async (data: DeleteCategoryByIdRequest) => {
    return api.post<DeleteCategoryByIdResponse>(
        `${prefix}/deleteCategoryById`,
        data
    );
};

// 通过 category_id 修改 category
export const UpdateCategoryById = async (data: UpdateCategoryByIdRequest) => {
    return api.post<UpdateCategoryByIdResponse>(
        `${prefix}/updateCategoryById`,
        data
    );
};

// 通过 api_id、category_id 修改 api 所属分类（仅支持正式表 Api）
export const UpdateApiCategoryById = async (
    data: UpdateApiCategoryByIdRequest
) => {
    return api.post<UpdateApiCategoryByIdResponse>(
        `${prefix}/updateApiCategoryById`,
        data
    );
};

// ---- 迭代相关 ----

// 新增 API 草稿
export const AddApi = async (data: AddApiRequest) => {
    return api.post<AddApiResponse>(`${prefix}/addApi`, data);
};

// 删除 API 草稿
export const DeleteApiByApiDraftId = async (
    data: DeleteApiByApiDraftIdRequest
) => {
    return api.post<DeleteApiByApiDraftIdResponse>(
        `${prefix}/deleteApiByApiDraftId`,
        data
    );
};

// 更新 API 草稿（包含请求/响应参数），注意 req_params / resp_params 以字符串形式传递
export const UpdateApiByApiDraftId = async (
    data: UpdateApiByApiDraftIdRequest
) => {
    const payload = {
        ...data,
        req_params: JSON.stringify(data.req_params ?? []),
        resp_params: JSON.stringify(data.resp_params ?? []),
    } as unknown as UpdateApiByApiDraftIdRequest & {
        req_params: string;
        resp_params: string;
    };
    return api.post<UpdateApiByApiDraftIdResponse>(
        `${prefix}/updateApiByApiDraftId`,
        payload
    );
};