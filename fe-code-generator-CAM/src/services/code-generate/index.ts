import * as fs from "fs";
import { CONFIG_FILE_NAME } from "../../templates/init";
import { GetServiceByUuidAndVersion } from "../apis/service";

const readConfig = () => {
    if (!fs.existsSync(CONFIG_FILE_NAME)) {
        return {};
    }
    try {
        const content = fs.readFileSync(CONFIG_FILE_NAME, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        return {};
    }
};

// 拉取service信息并存储到cam.config.json
export const storeServiceInfo = async (
    name: string,
    service_uuid: string,
    version: string
) => {
    const config = readConfig();
    // 检查name是否已存在
    if (config.services && config.services[name]) {
        console.warn(`Service name ${name} already exists`);
        process.exit(1);
    }
    // 检查service_uuid是否已存在
    if (
        Object.values(config.services || {}).some((v: any) => {
            const [existingUuid] = v.split("@");
            return existingUuid === service_uuid;
        })
    ) {
        console.warn(
            `Service ${service_uuid} already exists. If you want to update the version, please remove this service first.`
        );
        process.exit(1);
    }

    try {
        const res = await GetServiceByUuidAndVersion(service_uuid, version);
        if (res.status !== 200) {
            console.warn(res.message || "Failed to get service info");
            process.exit(1);
        }
        if (!config.services) {
            config.services = {};
        }
        config.services[name] = `${service_uuid}@${version}`;
        fs.writeFileSync(
            CONFIG_FILE_NAME,
            JSON.stringify(config, null, 2) + "\n"
        );
        console.log(`Service ${name} added successfully`);
        // todo: 拉取api（初次通过cli添加服务时进行拉取）
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

// 从cam.config.json中删除service
export const removeService = async (serviceName: string) => {
    const config = readConfig();
    if (!config.services || !config.services[serviceName]) {
        console.warn(`Service name ${serviceName} does not exist`);
        process.exit(1);
    }
    delete config.services[serviceName];
    try {
        fs.writeFileSync(CONFIG_FILE_NAME, JSON.stringify(config, null, 2));
        console.log(`Successfully removed service ${serviceName}`);
        // todo: 拉取api（删除服务时，更新api）
    } catch (error) {
        console.error(`Failed to remove service ${serviceName}:`, error);
        process.exit(1);
    }
};

export const pullApis = async () => {};
