import type { HttpMethod, ParamType } from "@/services/api/types";

export interface ParamItem {
    id: string;
    name: string;
    type: ParamType | string;
    required: boolean;
    description: string;
    default_value?: string;
    example: string;
    children?: ParamItem[];
    array_child_type?: ParamType | string;
}

export const HTTP_METHODS: HttpMethod[] = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
];

export const PARAM_TYPES: ParamType[] = [
    "string",
    "int",
    "double",
    "boolean",
    "array",
    "object",
    "binary",
];
