import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { CONFIG_FILE_CONTENT, CONFIG_FILE_NAME } from "../templates/init";
import { loginRequired } from "../utils/utils";

const update = async () => {
    const targetPath = path.join(process.cwd(), CONFIG_FILE_NAME);
    if (fs.existsSync(targetPath)) {
        console.warn(
            `${CONFIG_FILE_NAME} already exists in the current directory.\n` +
                "If you want to overwrite it, please delete the existing file."
        );
        return;
    }
    try {
        fs.writeFileSync(targetPath, CONFIG_FILE_CONTENT);
        console.log(`Successfully initialized ${CONFIG_FILE_NAME}`);
    } catch (error) {
        console.error(`Failed to initialize ${CONFIG_FILE_NAME}:`, error);
        process.exit(1);
    }
};

export const registerInitCommand = (program: Command) => {
    program
        .command("update")
        .description("Update and generate code for all services")
        .action(loginRequired(update));
};
