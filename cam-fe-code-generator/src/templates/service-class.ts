import { HttpMethod } from "../services/apis/api/types";
import { capitalizeFirstLetter } from "../utils/utils";

export interface ApiOption {
    functionName: string;
    apiMethod: HttpMethod;
    apiPath: string;
    reqBodyInterfaceName: string;
    reqQueryInterfaceName: string;
    reqPathInterfaceName: string;
    reqHeaderInterfaceName: string;
    reqCookieInterfaceName: string;
    respInterfaceNames: string[];
    reqBodyFields: string[];
    reqQueryFields: string[];
    reqPathFields: string[];
    reqHeaderFields: string[];
    reqCookieFields: string[];
}

// 一个service有一个serviceClass
export const serviceClassCode = (
    serviceName: string,
    apiOptions: ApiOption[]
) => {
    // 收集所有需要导入的接口
    const allImportInterfaces = new Set<string>();

    let methodsCode = "";

    for (const option of apiOptions) {
        const {
            functionName,
            apiMethod,
            apiPath,
            reqBodyInterfaceName,
            reqQueryInterfaceName,
            reqPathInterfaceName,
            reqHeaderInterfaceName,
            reqCookieInterfaceName,
            respInterfaceNames,
            reqBodyFields,
            reqQueryFields,
            reqPathFields,
            reqHeaderFields,
        } = option;

        const reqInterfaceNameWithValue = [
            reqBodyInterfaceName,
            reqQueryInterfaceName,
            reqPathInterfaceName,
            reqHeaderInterfaceName,
            reqCookieInterfaceName,
        ].filter(Boolean);

        // 添加到导入集合
        reqInterfaceNameWithValue.forEach((name) =>
            allImportInterfaces.add(name)
        );
        respInterfaceNames.forEach((name) => allImportInterfaces.add(name));

        // 参数类型
        const reqInterfaceName = reqInterfaceNameWithValue.join(" & ");
        const respInterfaceName = respInterfaceNames.join(" & ") || "any";

        // 生成5类参数代码
        const bodyParamsCode = reqBodyFields
            .map((field) => `'${field}': _req["${field}"]`)
            .join(", ");
        const queryParamsCode = reqQueryFields
            .map((field) => `'${field}': _req["${field}"]`)
            .join(", ");
        const headerParamsCode = reqHeaderFields
            .map((field) => `'${field}': _req["${field}"]`)
            .join(", ");

        let urlCode = `let url = this.genBaseURL('${apiPath}');`;

        // 处理 Path 参数替换
        if (reqPathFields && reqPathFields.length > 0) {
            reqPathFields.forEach((field) => {
                // 假设 path 中的参数形式为 {field}
                urlCode += `
    if (_req["${field}"] !== undefined && _req["${field}" ] !== null) {
      url = url.replace('{${field}}', String(_req["${field}"]));
    }`;
            });
        }

        const reqParamDef = reqInterfaceName
            ? `req: ${reqInterfaceName}`
            : `req?: any`;

        const apiFunctionCode = `
  ${functionName}(${reqParamDef}, options?: T): Promise<${respInterfaceName}> {
    const _req = req || {};
    ${urlCode}
    const method = '${apiMethod}';
    const data = ${bodyParamsCode ? `{ ${bodyParamsCode} }` : "undefined"};
    const params = ${queryParamsCode ? `{ ${queryParamsCode} }` : "undefined"};
    const headers = ${
        headerParamsCode ? `{ ${headerParamsCode} }` : "undefined"
    };
    return this.request({ url, method, data, params, headers }, options);
  }
        `;
        methodsCode += apiFunctionCode;
    }

    // 生成最终代码
    const importCode =
        allImportInterfaces.size > 0
            ? `import type { ${Array.from(allImportInterfaces).join(
                  ", "
              )} } from "./namespaces";\n`
            : "";

    let code = `
${importCode}
export default class ${capitalizeFirstLetter(serviceName)}Service<T> {
  private request: any = () => {
    throw new Error('${capitalizeFirstLetter(
        serviceName
    )}Service.request is undefined');
  };
  private baseURL: string | ((path: string) => string) = '';

  constructor(options?: {
    baseURL?: string | ((path: string) => string);
    request?<R>(
      params: {
        url: string;
        method: 'GET' |  'POST' | 'PUT' |'DELETE' | 'PATCH';
        data?: any;
        params?: any;
        headers?: any;
      },
      options?: T,
    ): Promise<R>;
  }) {
    this.request = options?.request || this.request;
    this.baseURL = options?.baseURL || this.baseURL;
  }

  private genBaseURL(path: string) {
    if (typeof this.baseURL === 'string') {
        const baseUrl = this.baseURL.trim().replace(/\\/+$/, "");
        const apiPath = path.trim().replace(/^\\/+/, "");
        return baseUrl + '/' + apiPath;
    }
    return this.baseURL(path);
  }

  /* API Services */
${methodsCode}
};
    `;
    return code;
};
