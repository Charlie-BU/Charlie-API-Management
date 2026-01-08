import * as fs from "fs";
import * as path from "path";
import { CONFIG_FILE_NAME } from "../../templates/init";

export interface CamConfig {
    services: Record<string, any>;
    outDir: string;
    generateConfig: {
        [key: string]: any;
    };
}

const getConfigPath = () => path.join(process.cwd(), CONFIG_FILE_NAME);

export const getConfig = (): CamConfig => {
    const configPath = getConfigPath();
    
    if (!fs.existsSync(configPath)) {
        throw new Error(`${CONFIG_FILE_NAME} not found in current directory. Please run 'cam init' first.`);
    }

    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to parse ${CONFIG_FILE_NAME}: ${error}`);
    }
};

export const getServices = () => getConfig().services;
export const getOutDir = () => getConfig().outDir;
export const getGenerateConfig = () => getConfig().generateConfig;
