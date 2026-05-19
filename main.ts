/** @format */

import process from "node:process";

import CLIData from "./modules/configuration.ts";
import * as DKFunctions from "./modules/functions.ts";
import * as DevKit from "./modules/typing.ts";

const Commands: string[] = [];
const cmds: Map<string, DevKit.DK.Commands.Command> = new Map();
const Flags: Map<string, DevKit.DK.Commands.Flag> = new Map();

if (process.argv.length < 2) DKFunctions.FatalException(202, "few arguments");
const args: readonly string[] = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
  const argument = args[i].trim().toWellFormed();

  if (argument.startsWith("-")) {
    const [flag, value] = argument.split("=", 2);
    Flags.set(flag, { name: flag.replaceAll("-", ""), value });
    continue;
  }

  Commands.push(argument);
}

const PrimaryArgument: string | null = Commands[0] || null;
const Help: boolean = PrimaryArgument
  ? PrimaryArgument === "help"
  : Flags.has("-h") || Flags.has("--help");
if (Help) {
  if (PrimaryArgument && PrimaryArgument === "help") {
    const HArgument: string | null = Commands[1] || null;
    if (HArgument) {
      const cmd = cmds.get(HArgument);

      if (!cmd) DKFunctions.FatalException(201, "invalid command");

      console.log(
        `${DKFunctions.GetTime()} => ${CLIData.name} - ${CLIData.version}`
      );
      console.log(
        `${process.argv0} ${cmd?.commandName} => ${cmd?.description}`
      );
      if (cmd?.aliases) {
        console.log("  Aliases:");
        console.log(` - ${cmd?.aliases.concat(", ")}`);
      }
      if (cmd?.subcommands) {
        console.log("  Subcommands");
        if (cmd?.subcommands instanceof Set) {
          cmd?.subcommands.forEach(v => console.log(`    ${v}`));
        }
      }
      if (cmd?.flags) {
        console.log("  Flags:");
        if (cmd?.flags instanceof Map) {
          const keys = cmd?.flags.keys();
          let key: string | undefined = keys.next().value;
          while (key) {
            const data = cmd?.flags.get(key);
            if (data) {
              if (data.optional) {
                if (data.description) {
                  console.log(`    [${data.name}] => ${data.description}`);
                } else {
                  console.log(`    [${data.name}]`);
                }
              } else {
                if (data.description) {
                  console.log(`    <${data.name}> => ${data.description}`);
                } else {
                  console.log(`    <${data.name}>`);
                }
              }
              key = keys.next().value;
            }
          }
        } else if (Array.isArray(cmd?.flags)) {
          for (const flag of cmd?.flags) {
            if (flag.optional) {
              if (flag.description) {
                console.log(`    [${flag.name}] => ${flag.description}`);
              } else {
                console.log(`    [${flag.name}]`);
              }
            } else {
              if (flag.description) {
                console.log(`    <${flag.name}> => ${flag.description}`);
              } else {
                console.log(`    <${flag.name}>`);
              }
            }
          }
        }
      }
    }
  }
}
