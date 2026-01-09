import prettier from "prettier";
import { login } from "../cli/user";
import { TokenManager } from "./data-manager";

export const loginRequired = (fn: (...args: any[]) => Promise<void> | void) => {
    return async (...args: any[]) => {
        const tokenManager = TokenManager.getInstance();
        const token = tokenManager.getToken();

        if (token) {
            return await fn(...args);
        }
        console.log("Please login to proceed.");
        await login();
        // Check token again after login attempt
        if (tokenManager.getToken()) {
            return await fn(...args);
        }
    };
};

export const isValidVersion = (value: string): boolean => {
    if (!value) {
        return false;
    }
    if (value === "latest") {
        return true;
    }
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(value)) {
        return false;
    }
    return true;
};

export const isValidFilename = (filename: string): boolean => {
    if (!filename) {
        return false;
    }
    // Check for invalid characters (Windows/Unix reserved)
    // < > : " / \ | ? * and control characters
    // eslint-disable-next-line no-control-regex
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/;
    if (invalidChars.test(filename)) {
        return false;
    }
    // Check for reserved names
    if (filename === "." || filename === "..") {
        return false;
    }
    return true;
};

export const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatCodeByPrettier = async (code: string) => {
    let formattedCode = code;
    try {
        formattedCode = await prettier.format(code, {
            parser: "typescript",
            tabWidth: 2,
            useTabs: false,
            semi: true,
            singleQuote: true,
        });
    } catch (error) {
        console.warn(`Prettier format failed, using unformatted code.`);
    }
    return formattedCode;
};
