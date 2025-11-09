export interface BaseResponse {
    status: number;
    message: string;
}

export interface ServiceItem {
    id: number;
    service_uuid: string;
    version: string;
    description?: string | null;
    owner_id: number;
    created_at: string;
    owner_name?: string | null;
}

export interface DeletedServiceItem extends ServiceItem {
    deleted_at: string;
}

export interface AllServiceItem extends DeletedServiceItem {
    is_deleted: boolean;
}

export interface UserBrief {
    id: number;
    username: string;
    nickname?: string | null;
    role?: string;
    level?: string;
}

export interface ApiBrief {
    id: number;
    name: string;
    method: string;
    path: string;
    description?: string | null;
    level?: string;
    is_enabled?: boolean;
    category_id?: number | null;
}

export interface ApiCategory {
    id: number;
    name: string;
    description?: string | null;
}

export interface ServiceIteration {
    id: number;
    service_id: number;
    creator_id?: number | null;
    version?: string | null;
    description?: string | null;
    is_committed: boolean;
    created_at?: string;
}

export interface ServiceDetail extends ServiceItem {
    owner_id: number;
    owner?: UserBrief | null;
    maintainers?: UserBrief[];
    apis?: ApiBrief[];
    api_categories?: ApiCategory[];
    iterations?: ServiceIteration[];
    created_at: string;
    updated_at?: string;
    is_deleted?: boolean;
    deleted_at?: string | null;
}

export interface ServiceListResponse extends BaseResponse {
    services: ServiceItem[];
    total: number;
}

export interface GetServiceByIdResponse extends BaseResponse {
    service: ServiceDetail;
}

export interface GetServiceByUuidAndVersionResponse extends BaseResponse {
    service: ServiceDetail;
    is_latest: boolean;
}

export interface GetAllVersionsByUuidResponse extends BaseResponse {
    versions: string[];
}

export interface CreateNewServiceRequest {
    service_uuid: string;
    description: string;
}

export interface CreateNewServiceResponse extends BaseResponse {
    service: ServiceDetail;
}

export interface GetAllDeletedServicesByUserIdResponse extends BaseResponse {
    deleted_services: DeletedServiceItem[];
    total: number;
}

export interface GetAllServicesResponse extends BaseResponse {
    services: AllServiceItem[];
    total: number;
}

export interface DeleteServiceByIdRequest {
    id: number;
}

export type DeleteServiceByIdResponse = BaseResponse;

export interface RestoreServiceByIdRequest {
    id: number;
}

export type RestoreServiceByIdResponse = BaseResponse;

export interface DeleteIterationByIdRequest {
    service_iteration_id: number;
}

export type DeleteIterationByIdResponse = BaseResponse;

export interface StartIterationRequest {
    service_id: number;
}

export interface StartIterationResponse extends BaseResponse {
    service_iteration_id: number;
}

export interface CommitIterationRequest {
    service_iteration_id: number;
    new_version: string;
}

export interface CommitIterationResponse extends BaseResponse {
    service_id: number;
    service_iteration_id: number;
    version: string;
}

export interface UpdateDescriptionRequest {
    service_iteration_id: number;
    description: string;
}

export type UpdateDescriptionResponse = BaseResponse;

export type ServiceRange =
    | "MyServices"
    | "HisServices"
    | "AllServices"
    | "MyDeletedServices";

export interface Pagination {
    page_size: number;
    current_page: number;
    total: number;
}
