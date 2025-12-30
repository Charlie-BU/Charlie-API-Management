import type { ParamType } from "@/services/api/types";
import { Tag } from "@cloud-materials/common";

export const getParamTypeTag = (
    type: ParamType,
    arrayChildType?: ParamType
) => {
    const typeTagColorMap: Record<ParamType, string> = {
        string: "blue",
        boolean: "orange",
        object: "magenta",
        int: "arcoblue",
        double: "purple",
        array: "cyan",
        binary: "pinkpurple",
    };
    if (type === "array" && arrayChildType) {
        return (
            <Tag
                color={typeTagColorMap[type]}
            >{`${type}<${arrayChildType}>`}</Tag>
        );
    }
    return <Tag color={typeTagColorMap[type]}>{type}</Tag>;
};
