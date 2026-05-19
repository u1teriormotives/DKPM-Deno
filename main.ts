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

function PrintHeader() {
  console.log(
    `${DKFunctions.GetTime()} => ${CLIData.name} - ${CLIData.version}`
  );
}
function PrintFlag(flag: DevKit.DK.Commands.FlagType) {
  const wrapper = flag.optional ? ["[", "]"] : ["<", ">"];
  const text = `${wrapper[0]}${flag.name}${wrapper[1]}`;

  if (flag.description) {
    console.log(`    ${text} => ${flag.description}`);
  } else {
    console.log(`    ${text}`);
  }
}
function PrintFlags(
  flags:
    | Map<string, DevKit.DK.Commands.FlagType>
    | DevKit.DK.Commands.FlagType[]
) {
  console.log("  Flags:");

  const list = flags instanceof Map ? [...flags.values()] : flags;

  for (const flag of list) {
    PrintFlag(flag);
  }
}
function PrintCommandHelp(cmd: DevKit.DK.Commands.Command) {
  PrintHeader();

  console.log(
    `${process.argv0} ${cmd.commandName} => ${cmd.description ?? "no description"}`
  );

  if (cmd.aliases?.length) {
    console.log("  Aliases:");
    console.log(`    ${cmd.aliases.join(", ")}`);
  }

  if (cmd.subcommands) {
    const subcommands = Array.isArray(cmd.subcommands)
      ? cmd.subcommands
      : [...cmd.subcommands];

    if (subcommands.length > 0) {
      console.log("  Subcommands:");
      for (const subcmd of subcommands) {
        console.log(`    ${subcmd}`);
      }
    }
  }

  if (cmd.flags) {
    PrintFlags(cmd.flags);
  }
}
function PrintHelp(): void {
  PrintHeader();

  console.log(`${process.argv0} <command> [flags]`);

  console.log("Commands:");
  console.log("  help => prints help");

  const commands: DevKit.DK.Commands.Command[] = [...cmds.values()];
  for (const cmd of commands) {
    if (cmd.description)
      console.log(`  ${cmd.commandName} => ${cmd.description}`);
    else console.log(`  ${cmd.commandName}`);
  }
}

if (Help) {
  if (PrimaryArgument === "help") {
    const HArgument = Commands[1] ?? null;

    if (HArgument) {
      const cmd = cmds.get(HArgument);
      if (!cmd) DKFunctions.FatalException(201, "invalid command");

      PrintCommandHelp(cmd as DevKit.DK.Commands.Command);
      process.exit(0);
    }

    PrintHelp();
    process.exit(0);
  }

  PrintHelp();
  process.exit(0);
}
if (!PrimaryArgument && (Flags.has("-v") || Flags.has("--version")))
  PrintHeader();

if (PrimaryArgument && cmds.has(PrimaryArgument)) {
  const cmd = cmds.get(PrimaryArgument);
  await cmd?.commandFunction(new Set(Commands.slice(1)), Flags);
} else {
  PrintHelp();
  DKFunctions.FatalException(201, "invalid command");
}
