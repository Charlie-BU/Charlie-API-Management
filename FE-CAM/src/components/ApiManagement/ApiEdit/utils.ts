import type {
    ApiReqParamInput,
    ApiRespParamInput,
    ParamLocation,
    ParamType,
} from "@/services/api/types";
import type { ParamItem } from "./types";

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const transformReqParamsToApiInput = (
    requestParams: Record<string, ParamItem[]>
): ApiReqParamInput[] => {
    const req_params: ApiReqParamInput[] = [];
    if (!requestParams) return req_params;

    Object.entries(requestParams).forEach(([key, items]) => {
        const location = key as ParamLocation;
        if (Array.isArray(items)) {
            req_params.push(...processReqItems(items, location));
        }
    });
    return req_params;
};

const processReqItems = (
    list: ParamItem[],
    location: ParamLocation
): ApiReqParamInput[] => {
    return list.map((item) => ({
        name: item.name,
        type: item.type as ParamType,
        location: location,
        required: item.required,
        default_value: item.default_value || null,
        description: item.description,
        example: item.example,
        array_child_type: (item.array_child_type as ParamType) || null,
        children: (item.children || (item as any).children_params)
            ? processReqItems((item.children || (item as any).children_params), location)
            : undefined,
    }));
};

export const transformRespParamsToApiInput = (
    responseParams: Record<string, ParamItem[]>
): ApiRespParamInput[] => {
    const resp_params: ApiRespParamInput[] = [];
    if (!responseParams) return resp_params;

    Object.entries(responseParams).forEach(([key, items]) => {
        const statusCode = parseInt(key, 10);
        if (Array.isArray(items)) {
            resp_params.push(...processRespItems(items, statusCode));
        }
    });
    return resp_params;
};

const processRespItems = (
    list: ParamItem[],
    statusCode: number
): ApiRespParamInput[] => {
    return list.map((item) => ({
        name: item.name,
        type: item.type as ParamType,
        status_code: statusCode,
        required: item.required,
        description: item.description,
        example: item.example,
        array_child_type: (item.array_child_type as ParamType) || null,
        children: item.children
            ? processRespItems(item.children, statusCode)
            : undefined,
    }));
};

// Tree manipulation utilities for ParamsTable
export const updateTreeItem = (
    list: ParamItem[],
    id: string,
    field: keyof ParamItem,
    val: any
): ParamItem[] => {
    return list.map((item) => {
        if (item.id === id) {
            return { ...item, [field]: val };
        }
        if (item.children) {
            return {
                ...item,
                children: updateTreeItem(item.children, id, field, val),
            };
        }
        return item;
    });
};

export const addTreeItem = (
    list: ParamItem[],
    parentId?: string
): ParamItem[] => {
    const newItem: ParamItem = {
        id: generateId(),
        name: "",
        type: "string",
        required: true,
        description: "",
        default_value: "",
        example: "",
    };

    if (!parentId) {
        return [...list, newItem];
    }

    const addChildren = (items: ParamItem[]): ParamItem[] => {
        return items.map((item) => {
            if (item.id === parentId) {
                return {
                    ...item,
                    children: [...(item.children || []), newItem],
                };
            }
            if (item.children) {
                return {
                    ...item,
                    children: addChildren(item.children),
                };
            }
            return item;
        });
    };
    return addChildren(list);
};

export const deleteTreeItem = (
    list: ParamItem[],
    id: string
): ParamItem[] => {
    return list.filter((item) => {
        if (item.id === id) return false;
        if (item.children) {
            item.children = deleteTreeItem(item.children, id);
        }
        return true;
    });
};
