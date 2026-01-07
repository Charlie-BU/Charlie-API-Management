#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

const program = new Command();

program
    .name("cam")
    .description("CAM frontend code generator CLI")
    .version("0.0.2");

program
    .command("init")
    .description("Initialize a new configuration file")
    .action(() => {
        const configContent = {
            services: {},
            params: {
                param1: "",
                param2: "",
            },
        };

        const targetPath = path.join(process.cwd(), "cam.config.json");

        if (fs.existsSync(targetPath)) {
            console.warn(
                "cam.config.json already exists in the current directory."
            );
            return;
        }

        try {
            fs.writeFileSync(
                targetPath,
                JSON.stringify(configContent, null, 2)
            );
            console.log("Successfully created cam.config.json");
        } catch (error) {
            console.error("Failed to create cam.config.json:", error);
            process.exit(1);
        }
    });

program.parse(process.argv);
