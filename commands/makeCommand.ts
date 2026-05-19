// deno-lint-ignore-file no-unused-vars
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  FatalException,
  GetTime,
  NonfatalException,
} from "../exports/functions.ts";
import * as DK from "../exports/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function FetchEndpoint(
  endpoint: string,
  filepath: string,
  headers: object | undefined,
  mode: DK.FileModes,
): Promise<void> {
  if (endpoint === "null") {
    return FatalException(
      0xf0000 | 404,
      `resource does not exist in endpoints data`,
    );
  }
  console.log(`${GetTime()} -> attempting to GET resource @ ${endpoint}`);

  const request = await fetch(endpoint, {
    method: "GET",
    headers: headers ?? {},
  });
  console.log(`${GetTime()} -> resource returned (code ${request.status})`);
  if (request.status !== 200) {
    return FatalException(
      0xf0000 | request.status,
      `failed to GET resource; is the server online?`,
    );
  }

  const data = await request.text();
  try {
    console.log(`${GetTime()} -> writing resource data to ${filepath}`);
    await fs.writeFile(filepath, data, { encoding: "utf8", mode });
    console.log(
      `${GetTime()} -> written & set filemode to 0${mode.toString(8)}`,
    );
    return;
  } catch (error) {
    return FatalException(100, "cannot write file; do you have permissions?");
  }
}

export const makeCommand: DK.Commands.Command = {
  commandName: "make",
  aliases: null,
  description: "Make a file from the DevKit library",
  flags: [{ name: "--path", optional: true }],
  subcommands: ["apikey/keygen", "dkroute", "indexhtml"],
  func: async (
    subcommands: string[],
    flags: DK.Commands.Flag[],
  ): Promise<void> => {
    if (subcommands.length > 2) NonfatalException(100, "many arguments");
    else if (subcommands.length === 0) {
      return FatalException(101, "too little arguments (missing <module>");
    }

    const mod: string = subcommands[0];

    switch (mod) {
      case "apikey":
      case "keygen": {
        const endpoint: string =
          "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Libraries/APIKeyGenerator.c";

        let pathFlag: DK.Commands.Flag | null = null;
        for (const flag of flags) {
          if (flag.name === "--path") {
            pathFlag = flag;
            break;
          }
        }
        const p = pathFlag?.value ?? "keygen.c";

        await FetchEndpoint(endpoint, p, undefined, DK.FileModes.RW);

        console.log(`${GetTime()} -> spawning gcc process`);
        const compile = spawn("gcc", [p, "-o", "APIKeyGenerator"]);
        compile.stdout.on("data", (msg) => console.log(`GCC => ${msg}`));
        compile.stderr.on("data", (msg) => console.error(`GCC => ${msg}`));
        compile.on("error", (e) => FatalException(600, e.message));

        compile.on("close", () =>
          console.log(
            `${GetTime()} -> output compiled binary to ./APIKeyGenerator`,
          ),
        );
        break;
      }
      case "dkroute": {
        const endpoint: string =
          "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Routing/DKRoute.json";

        let pathFlag: DK.Commands.Flag | null = null;
        for (const flag of flags) {
          if (flag.name === "--path") {
            pathFlag = flag;
            break;
          }
        }
        const p = pathFlag?.value ?? "DKRoute";

        await FetchEndpoint(endpoint, p, undefined, DK.FileModes.RW);

        break;
      }
      case "indexhtml": {
        const endpoint: string =
          "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Routing/generic_index.html";

        let pathFlag: DK.Commands.Flag | null = null;
        for (const flag of flags) {
          if (flag.name === "--path") {
            pathFlag = flag;
            break;
          }
        }
        const p = pathFlag?.value ?? "index.html";

        await FetchEndpoint(endpoint, p, undefined, DK.FileModes.RW);

        break;
      }
      default:
        FatalException(0x100, `unknown module ${mod}`);
    }
  },
};
