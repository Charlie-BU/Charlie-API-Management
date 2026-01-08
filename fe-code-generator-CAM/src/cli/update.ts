import { Command } from "commander";
import { loginRequired } from "../utils/utils";
import { pullAllApisInAllServices } from "../services/code-generate";

export const registerUpdateCommand = (program: Command) => {
    program
        .command("update")
        .description("Update and generate code for all services")
        .action(loginRequired(pullAllApisInAllServices));
};
