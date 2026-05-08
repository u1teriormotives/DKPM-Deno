// deno-lint-ignore-file no-unused-vars
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { fetchCommand } from "./commands/fetchCommand.ts";
import { makeCommand } from "./commands/makeCommand.ts";
import {
  FatalException,
  GetTime,
  NonfatalException,
} from "./exports/functions.ts";
import * as DK from "./exports/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIData: DK.CLIData = {
  cliName: "dkpm",
  version: "v0.2.0-beta",
};

const commands: Map<string, DK.Commands.Command> = new Map();
commands.set("fetch", fetchCommand);
commands.set("make", makeCommand);

const subcommands: string[] = [];
const flags: DK.Commands.Flag[] = [];
const checkFlags: Map<string, DK.Commands.Flag> = new Map();
let displayHelp = false;

const args: string[] = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg.startsWith("-")) {
    const parts = arg.split("=", 2);
    const name = parts[0].trim().toWellFormed();

    if (name === "-h" || name === "--help") displayHelp = true;
    const fl: DK.Commands.Flag = { name, value: parts[1] || null };

    flags.push(fl);
    checkFlags.set(name, fl);
    continue;
  }

  subcommands.push(arg);
}

const primaryArgument = subcommands[0] || null;
if ((primaryArgument || primaryArgument !== null) && displayHelp) {
  const cmd = commands.get(primaryArgument);
  if (cmd !== undefined) {
    if (cmd.description) {
      console.log(
        `${GetTime()} -> ${
          process.argv[0]
        } ${cmd.commandName} => ${cmd.description} \\`,
      );
    } else {
      console.log(`${GetTime()} -> ${process.argv[0]} ${cmd.commandName} \\`);
    }
    if (cmd.aliases !== null && cmd.aliases !== undefined) {
      console.log(`  ${cmd.aliases?.join(" ")} \\`);
    }

    if (cmd.subcommands !== null) {
      for (const subcmd of cmd.subcommands) {
        console.log(`  ${subcmd} \\`);
      }
    }

    if (cmd.flags !== null && cmd.flags !== null) {
      if (Array.isArray(cmd.flags)) {
        for (let i = 0; i < cmd.flags.length; i++) {
          const f = cmd.flags[i];
          if (f.optional) {
            console.log(`  [${f.name}]`);
          } else {
            console.log(`  <${f.name}>`);
          }
        }
      } else if (cmd.flags instanceof Map) {
        const it = cmd.flags.keys();
        let key = it.next();
        while (key.value !== undefined && key.value !== null) {
          const f = cmd.flags.get(key.value);
          if (f === undefined) {
            key = it.next();
            continue;
          }
          if (f.optional) {
            console.log(`  [${f.name}]`);
          } else {
            console.log(`  <${f.name}>`);
          }
          key = it.next();
        }
      }
    }
  }

  process.exit(0);
} else if (displayHelp || !primaryArgument) {
  const it = commands.keys();
  let key = it.next();

  console.log(`${GetTime()} -> ${CLIData.cliName}, version ${CLIData.version}`);

  while (key.value !== undefined) {
    const cmd = commands.get(key.value);
    if (cmd === undefined) {
      key = it.next();
      continue;
    }

    const desc = cmd.description ?? null;
    if (desc) {
      console.log(`  ${cmd.commandName} => ${desc}`);
    } else {
      console.log(`  ${cmd.commandName}`);
    }

    key = it.next();
    continue;
  }

  process.exit(0);
} else if (checkFlags.has("-v") || checkFlags.has("--version")) {
  console.log(`${GetTime()} -> ${CLIData.cliName} version ${CLIData.version}`);
}

if (primaryArgument) {
  const cmd = commands.get(primaryArgument);
  if (!cmd) {
    FatalException(300, "command does not exist");
  }

  const func = cmd?.func;
  if (func !== undefined) {
    await func(subcommands.slice(1), flags);
  }
}
