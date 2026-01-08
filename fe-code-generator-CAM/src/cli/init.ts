import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { VERSION } from "../version";
import { CONFIG_FILE_CONTENT, CONFIG_FILE_NAME } from "../templates/init";
import { loginRequired } from "../utils/utils";

const init = async () => {
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
        console.log(
            `version: ${VERSION}\nSuccessfully initialized ${CONFIG_FILE_NAME}`
        );
    } catch (error) {
        console.error(`Failed to initialize ${CONFIG_FILE_NAME}:`, error);
        process.exit(1);
    }
};

export const registerInitCommand = (program: Command) => {
    program
        .command("init")
        .description("Initialize a new configuration file")
        .action(loginRequired(init));
};
