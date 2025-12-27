import type { ParamType } from "@/services/api/types";

export interface ParamItem {
    id: string;
    name: string;
    type: ParamType | string;
    required: boolean;
    description: string;
    example: string;
    children?: ParamItem[];
    array_child_type?: ParamType | string;
}

export const TYPES: ParamType[] = [
    "string",
    "int",
    "double",
    "boolean",
    "array",
    "object",
    "binary",
];
