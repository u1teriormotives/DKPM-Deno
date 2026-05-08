// deno-lint-ignore-file no-unused-vars
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

const EndpointsData: DK.EndpointsData = {
  js: "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Routing/JavaScript/index.js",
  csharp: [
    "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Routing/C%23/Program.cs", // add more later
  ],
};

export const fetchCommand: DK.Commands.Command = {
  commandName: "fetch",
  description: "Fetch a module from the DevKit project",
  aliases: null,
  subcommands: ["route <js/javascript/csharp>"],
  flags: [{ name: "--path", optional: true }],
  func: async (subcommands: string[], flags: DK.Commands.Flag[]) => {
    if (subcommands.length > 2) NonfatalException(100, "many arguments");
    else if (subcommands.length === 0) {
      return FatalException(101, "too little arguments (missing <module>");
    }

    const mod: string = subcommands[0];

    switch (mod) {
      case "route": {
        if (subcommands.length === 2) {
          const routeType: string = subcommands[1];
          switch (routeType) {
            case "js":
            case "javascript": {
              const endpoint: string =
                typeof EndpointsData.js === "string"
                  ? EndpointsData.js
                  : "null";

              let pathFlag: DK.Commands.Flag | null = null;
              for (const flag of flags) {
                if (flag.name === "--path") {
                  pathFlag = flag;
                  break;
                }
              }
              const p = pathFlag?.value ?? path.join(__dirname, "route");
              return await FetchEndpoint(
                endpoint,
                p,
                undefined,
                DK.FileModes.RWE,
              );
            }
          }
        }
      }
    }

    return;
  },
};
