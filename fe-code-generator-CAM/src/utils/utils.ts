import { login } from "../cli/user";
import { TokenManager } from "./token-manager";

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
