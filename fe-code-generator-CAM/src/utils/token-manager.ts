import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { UserProfile } from "../services/types";

const CONFIG_FILE = ".camrc";

interface CamrcConfig {
    token?: string;
    user?: UserProfile;
}

export class TokenManager {
    private static instance: TokenManager;
    private configPath: string;

    // 确保单例
    private constructor() {
        this.configPath = path.join(os.homedir(), CONFIG_FILE);
    }

    public static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    private readConfig(): CamrcConfig {
        if (!fs.existsSync(this.configPath)) {
            return {};
        }
        try {
            const content = fs.readFileSync(this.configPath, "utf-8");
            return JSON.parse(content);
        } catch (error) {
            return {};
        }
    }

    setToken(token: string): void {
        const config = this.readConfig();
        config.token = token;
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), {
            mode: 0o600,
        });
    }

    getToken(): string | null {
        const config = this.readConfig();
        return config.token || null;
    }

    setUser(user: UserProfile): void {
        const config = this.readConfig();
        config.user = user;
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), {
            mode: 0o600,
        });
    }

    getUser(): UserProfile | null {
        const config = this.readConfig();
        return config.user || null;
    }

    clearConfig(): void {
        if (fs.existsSync(this.configPath)) {
            fs.unlinkSync(this.configPath);
        }
    }
}
