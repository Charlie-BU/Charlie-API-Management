import {
    ApiDetail,
    ApiDraftDetail,
    ParamLocation,
    RequestParam,
    RequestParamDraft,
    ResponseParam,
    ResponseParamDraft,
} from "../apis/api/types";

interface GeneratedCode {
    namespaces: string[];
    functions: string;
}

const tsTypeMap = (type: string, arrayChildType?: string | null): string => {
    switch (type) {
        case "int":
        case "float":
        case "double":
        case "long":
            return "number";
        case "string":
        case "text":
            return "string";
        case "boolean":
        case "bool":
            return "boolean";
        case "array":
        case "list":
            if (arrayChildType) {
                return `${tsTypeMap(arrayChildType)}[]`;
            }
            return "any[]";
        case "object":
        case "map":
            return "any"; // Complex objects are handled by creating new interfaces
        default:
            return "any";
    }
};

const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const generateInterface = (
    name: string,
    params: any[],
    _parentName: string = ""
): string[] => {
    const interfaces: string[] = [];
    const fields: string[] = [];
    const interfaceName = `${capitalizeFirstLetter(name)}`;

    params.forEach((param) => {
        let type = tsTypeMap(param.type, param.array_child_type);
        const fieldName = param.name;
        const isOptional = !param.required;
        const comment = param.description
            ? `  /* ${param.description} */\n`
            : "";

        if (
            param.type === "object" &&
            param.children_params &&
            param.children_params.length > 0
        ) {
            const childInterfaceName = `${capitalizeFirstLetter(fieldName)}`;
            const childInterfaces = generateInterface(
                childInterfaceName,
                param.children_params,
                interfaceName
            );
            interfaces.push(...childInterfaces);
            type = childInterfaceName; // Use the generated interface name
        } else if (
            param.type === "array" &&
            param.array_child_type === "object" &&
            param.children_params &&
            param.children_params.length > 0
        ) {
            // Handle array of objects if needed
            const childInterfaceName = `${capitalizeFirstLetter(
                fieldName
            )}Item`;
            const childInterfaces = generateInterface(
                childInterfaceName,
                param.children_params,
                interfaceName
            );
            interfaces.push(...childInterfaces);
            type = `${childInterfaceName}[]`;
        }

        fields.push(
            `${comment}  ${fieldName}${isOptional ? "?" : ""}: ${type};`
        );
    });

    const currentInterface = `export interface ${interfaceName} {\n${fields.join(
        "\n"
    )}\n}`;
    interfaces.push(currentInterface);

    return interfaces;
};

export const generateTSCode = (
    api: ApiDetail | ApiDraftDetail
): GeneratedCode => {
    const namespaces: string[] = [];
    let requestInterfaceName = "";
    let responseInterfaceName = "";

    // 1. Generate Request Interface (Query, Body, etc.)
    const requestParams =
        api.request_params_by_location ||
        ({} as
            | Record<ParamLocation, RequestParam[]>
            | Record<ParamLocation, RequestParamDraft[]>);

    for (const location of Object.keys(requestParams)) {
        const params = requestParams[location as ParamLocation];
        if (params.length > 0) {
            requestInterfaceName = `${capitalizeFirstLetter(
                api.name
            )}${capitalizeFirstLetter(location)}Request`;
            const reqInterfaces = generateInterface(
                requestInterfaceName,
                params
            );
            namespaces.push(...reqInterfaces);
        }
    }

    // 2. Generate Response Interface
    const responseParams =
        api.response_params_by_status_code ||
        ({} as
            | Record<number, ResponseParam[]>
            | Record<number, ResponseParamDraft[]>);

    for (const statusCode of Object.keys(responseParams)) {
        const params = responseParams[Number(statusCode)];
        if (!params) {
            continue;
        }
        if (params.length > 0) {
            responseInterfaceName = `${capitalizeFirstLetter(
                api.name
            )}${statusCode}Response`;
            const resInterfaces = generateInterface(
                responseInterfaceName,
                params
            );
            namespaces.push(...resInterfaces);
        }
    }

    // todo: 3. Generate Function
    const functionName = api.name;
    const method = api.method.toLowerCase();
    const url = api.path; // Note: Path params replacement logic might be needed if url contains :param

    const reqType = requestInterfaceName ? `data: ${requestInterfaceName}` : "";
    const resType = responseInterfaceName
        ? `Promise<${responseInterfaceName}>`
        : "Promise<any>";

    const functionBody = `
export const ${functionName} = (${reqType}): ${resType} => {
  return request({
    url: \`${url}\`,
    method: '${method}',
    ${requestInterfaceName ? "data," : ""}
  });
}`;

    return {
        namespaces,
        functions: functionBody.trim(),
    };
};
