export interface ServiceItem {
    id: number;
    service_uuid: string;
    version: string;
    description?: string | null;
}

export interface ServiceListResponse {
    status: number;
    message: string;
    services: ServiceItem[];
}