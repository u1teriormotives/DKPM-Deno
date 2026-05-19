/** @format */

import process from "node:process";

import CLIData from "./modules/configuration.ts";
import * as DKFunctions from "./modules/functions.ts";
import * as DevKit from "./modules/typing.ts";

const Commands: string[] = [];
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
