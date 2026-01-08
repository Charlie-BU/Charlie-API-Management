import { Command } from "commander";
import * as inquirer from "inquirer";
import { TokenManager } from "../utils/token-manager";
import axios from "axios";
import { GetMyInfo, UserLogin } from "../services";
import { UserProfile } from "../services/types";
import Table from "cli-table3";

export const login = async () => {
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "username",
            message: "Username:",
            validate: (input: string) =>
                input.length > 0 || "Username is required",
        },
        {
            type: "password",
            name: "password",
            message: "Password:",
            mask: "*",
            validate: (input: string) =>
                input.length > 0 || "Password is required",
        },
    ]);

    try {
        console.log("Authenticating...");
        const loginRes = await UserLogin({
            username: answers.username,
            password: answers.password,
        });
        if (loginRes.status !== 200) {
            console.warn(loginRes.message || "Login failed");
            return;
        }
        const token = loginRes.access_token;
        const tokenManager = TokenManager.getInstance();
        tokenManager.setToken(token);

        const getUserRes = await GetMyInfo();
        if (getUserRes.status !== 200) {
            console.warn(getUserRes.message || "Get user info failed");
            return;
        }
        const user = getUserRes.user;
        tokenManager.setUser(user);
        console.log(
            `Logged in as ${user.nickname} (${user.username}) - ${user.email}`
        );
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(error.response?.data?.message || error.message);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
};

const logout = () => {
    const tokenManager = TokenManager.getInstance();
    if (!tokenManager.getToken()) {
        console.warn("No user logged in");
        return;
    }
    tokenManager.setToken("");
    tokenManager.setUser({} as UserProfile);
    console.log("Logged out successfully");
};

const whoami = () => {
    const tokenManager = TokenManager.getInstance();
    if (!tokenManager.getToken()) {
        console.warn("No user logged in");
        return;
    }
    const user = tokenManager.getUser();
    if (!user || !user.username) {
        console.warn("User info not found");
        return;
    }
    const table = new Table();
    table.push(
        ["Username", user.username],
        ["Nickname", user.nickname],
        ["Email", user.email],
        ["Role", user.role]
    );
    console.log(table.toString());
};

export const registerLoginCommand = (program: Command) => {
    program.command("login").description("Login to CAM service").action(login);
};

export const registerLogoutCommand = (program: Command) => {
    program
        .command("logout")
        .description("Logout from CAM service")
        .action(logout);
};

export const registerWhoamiCommand = (program: Command) => {
    program
        .command("whoami")
        .description("Show current logged in user")
        .action(whoami);
};
