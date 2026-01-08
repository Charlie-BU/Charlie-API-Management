#!/usr/bin/env node

import { Command } from "commander";
import { VERSION } from "../version";
import { registerInitCommand } from "./init";
import {
    registerLoginCommand,
    registerLogoutCommand,
    registerWhoamiCommand,
} from "./user";
import { registerAddServiceCommand } from "./add-service";

const program = new Command();

program
    .name("cam")
    .description("CAM frontend code generator CLI")
    .version(VERSION);

registerInitCommand(program);
registerLoginCommand(program);
registerLogoutCommand(program);
registerWhoamiCommand(program);
registerAddServiceCommand(program);

program.parse(process.argv);
