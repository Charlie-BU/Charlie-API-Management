import { Command } from "commander";
import { isValidFilename, isValidVersion, loginRequired } from "../utils/utils";

const addService = async (serviceIdentifier: string) => {
    const parts = serviceIdentifier.split("@");
    const nameAndUuid = parts[0];
    const version = parts[1] || "latest";

    if (!isValidVersion(version)) {
        console.error(
            "Invalid version format. Version must be in the format x.y.z (where x, y, and z are non-negative integers)."
        );
        process.exit(1);
    }
    if (!nameAndUuid) {
        console.error(
            "Invalid format. Usage: cam add <service_name>:<service_uuid>@<version | latest>"
        );
        process.exit(1);
    }

    const [serviceName, serviceUuid] = nameAndUuid.split(":");
    if (!serviceName || !serviceUuid) {
        console.error(
            "Invalid format. Usage: cam add <service_name>:<service_uuid>@<version | latest>"
        );
        process.exit(1);
    }
    if (!isValidFilename(serviceName)) {
        console.error(
            `Invalid service name: "${serviceName}". Service name must be a valid directory/file name.`
        );
        process.exit(1);
    }

    console.log(`Service Name: ${serviceName}`);
    console.log(`Service UUID: ${serviceUuid}`);
    console.log(`Version: ${version}`);
};

export const registerAddServiceCommand = (program: Command) => {
    program
        .command("add <name:uuid@version>")
        .description(
            "Add a new service. Usage: cam add <service_name>:<service_uuid>@<version | latest>"
        )
        .action(loginRequired(addService));
};
