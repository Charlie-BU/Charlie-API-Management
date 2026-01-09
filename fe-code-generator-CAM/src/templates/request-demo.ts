export const requestDemoCode = (demoServiceName: string) => `
// This is a demo request code for how to use auto generated service class.
// You can also use your own request instance like axios or fetch.

import axios, { type AxiosRequestConfig } from "axios"; // Install axios if you haven't
import ${demoServiceName}Service from "./${demoServiceName}/index";

const BASE_URL = "http://localhost:3000"; // Change to the actual base URL

export const demoServiceForAxios = new ${demoServiceName}Service<AxiosRequestConfig>({
    baseURL: BASE_URL,
    request: (config, _options) =>
        axios.request({ ...config }).then((res) => res.data), // Pay attention to the serialization of the response data
});

export const demoServiceForFetch = new ${demoServiceName}Service<RequestInit>({
    baseURL: BASE_URL,
    request: (config, _options) =>
        fetch(BASE_URL + config.url, { ...config }).then((res) => res.json()), // Pay attention to the serialization of the response data
});
`;
