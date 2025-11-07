// api 模块：请求与响应类型定义

export interface BaseResponse {
    status: number;
    message: string;
}

// 与后端枚举保持一致的字符串字面量类型
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type ApiLevel = "P0" | "P1" | "P2" | "P3" | "P4";
export type ParamLocation = "query" | "path" | "header" | "cookie" | "body";
export type ParamType =
    | "string"
    | "int"
    | "double"
    | "boolean"
    | "array"
    | "object"
    | "binary";

// 复用在 api 模块内的基础对象
export interface UserBrief {
    id: number;
    username: string;
    nickname?: string | null;
    role?: string;
    level?: string;
}

export interface ServiceItem {
    id: number;
    service_uuid: string;
    version: string;
    description?: string | null;
}

export interface ApiCategory {
    id: number;
    name: string;
    description?: string | null;
}

export interface ApiBrief {
    id: number;
    name: string;
    method: HttpMethod | string;
    path: string;
    description?: string | null;
    level?: ApiLevel | string;
    is_enabled?: boolean;
    category_id?: number | null;
}

// 正式表 Api 的详情（包含关系）
export interface RequestParam {
    id: number;
    api_id: number;
    name: string;
    location: ParamLocation | string;
    type: ParamType | string;
    required: boolean;
    default_value?: string | null;
    description?: string | null;
    example?: string | null;
    array_child_type?: ParamType | string | null;
    parent_param_id?: number | null;
}

export interface ResponseParam {
    id: number;
    api_id: number;
    status_code: number;
    name: string;
    type: ParamType | string;
    required: boolean;
    description?: string | null;
    example?: string | null;
    array_child_type?: ParamType | string | null;
    parent_param_id?: number | null;
}

export interface ApiDetail extends ApiBrief {
    service_id: number;
    owner_id: number;
    created_at?: string;
    updated_at?: string;
    owner?: UserBrief | null;
    category?: ApiCategory | null;
    service?: ServiceItem | null;
    request_params?: RequestParam[];
    response_params?: ResponseParam[];
}

// 草稿表 ApiDraft 的详情（包含关系）
export interface RequestParamDraft {
    id: number;
    api_draft_id: number;
    name: string;
    location: ParamLocation | string;
    type: ParamType | string;
    required: boolean;
    default_value?: string | null;
    description?: string | null;
    example?: string | null;
    array_child_type?: ParamType | string | null;
    parent_param_id?: number | null;
}

export interface ResponseParamDraft {
    id: number;
    api_draft_id: number;
    status_code: number;
    name: string;
    type: ParamType | string;
    required: boolean;
    description?: string | null;
    example?: string | null;
    array_child_type?: ParamType | string | null;
    parent_param_id?: number | null;
}

export interface ApiDraftItem {
    id: number;
    service_iteration_id: number;
    owner_id: number;
    category_id?: number | null;
    name: string;
    method: HttpMethod | string;
    path: string;
    description?: string | null;
    level?: ApiLevel | string;
    is_enabled?: boolean;
    created_at?: string;
    updated_at?: string;
    owner?: UserBrief | null;
    category?: ApiCategory | null;
}

export interface ApiDraftDetail extends ApiDraftItem {
    request_params?: RequestParamDraft[];
    response_params?: ResponseParamDraft[];
}

// ---- 请求/响应类型 ----

export interface GetAllCategoriesByServiceIdRequest {
    service_id: number;
}

export interface GetAllCategoriesByServiceIdResponse extends BaseResponse {
    categories: ApiCategory[];
}

export interface GetAllApisByServiceIdRequest {
    service_id: number;
    category_id: number; // 当前路由实现中要求同时提供
}

export interface GetAllApisByServiceIdResponse extends BaseResponse {
    apis: ApiBrief[];
}

export interface GetApiByIdRequest {
    api_id: number;
    is_latest?: boolean; // 默认 true
}

export interface GetApiByIdResponse extends BaseResponse {
    api: ApiDetail | ApiDraftDetail;
}

export interface AddCategoryByServiceIdRequest {
    service_id: number;
    category_name: string;
    description: string | null;
}

export interface AddCategoryByServiceIdResponse extends BaseResponse {
    category: ApiCategory;
}

export interface DeleteCategoryByIdRequest {
    category_id: number;
}

export type DeleteCategoryByIdResponse = BaseResponse;

export interface UpdateCategoryByIdRequest {
    category_id: number;
    category_name: string | null;
    description: string | null;
}

export interface UpdateCategoryByIdResponse extends BaseResponse {
    category: ApiCategory;
}

export interface UpdateApiCategoryByIdRequest {
    api_id: number;
    category_id: number;
}

export type UpdateApiCategoryByIdResponse = BaseResponse;

// 迭代相关
export interface AddApiRequest {
    service_iteration_id: number;
    name: string;
    method: HttpMethod | string;
    path: string;
    description: string;
    level: ApiLevel | string;
    category_id?: number | null;
}

export interface AddApiResponse extends BaseResponse {
    api: ApiDraftItem;
}

export interface DeleteApiByApiDraftIdRequest {
    service_iteration_id: number;
    api_draft_id: number;
}

export type DeleteApiByApiDraftIdResponse = BaseResponse;

// 更新 API 草稿时携带的参数输入结构（会被 stringify 传给后端）
export interface ApiReqParamInput {
    name: string;
    type: ParamType | string;
    location?: ParamLocation | string; // 顶层必填，子参数继承
    required?: boolean;
    default_value?: string | null;
    description?: string | null;
    example?: string | null;
    array_child_type?: ParamType | string | null;
    children?: ApiReqParamInput[]; // object 类型支持嵌套
}

export interface ApiRespParamInput {
    status_code?: number; // 默认 200
    name: string;
    type: ParamType | string;
    required?: boolean;
    description?: string | null;
    example?: string | null;
    array_child_type?: ParamType | string | null;
    children?: ApiRespParamInput[]; // object 类型支持嵌套
}

export interface UpdateApiByApiDraftIdRequest {
    service_iteration_id: number;
    api_draft_id: number;
    name: string;
    method: HttpMethod | string;
    path: string;
    description: string;
    level: ApiLevel | string;
    req_params: ApiReqParamInput[];
    resp_params: ApiRespParamInput[];
}

export type UpdateApiByApiDraftIdResponse = BaseResponse;