/** @format */

import * as DevKit from "./typing.ts";

function tab(indents = 1) {
  return "  ".repeat(Math.max(1, indents));
}

function zshSingleQuote(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function zshChoice(value: string) {
  return value
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\s+/g, "\\ ");
}

function clean(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function extractSubcommandName(raw: string) {
  const firstToken = raw.trim().split(/\s+/)[0] ?? "";
  return firstToken.split("/")[0] ?? "";
}

function asArray<T>(value: Set<T> | T[] | null | undefined): T[] {
  if (!value) return [];
  return value instanceof Set ? [...value] : value;
}

function flagArray(
  flags: DevKit.DK.Commands.Command["flags"]
): DevKit.DK.Commands.FlagType[] {
  if (!flags) return [];
  return flags instanceof Map ? [...flags.values()] : flags;
}

function continuationLine(indent: number, text: string, continued: boolean) {
  console.log(`${tab(indent)}${text}${continued ? " \\" : ""}`);
}

function emitArguments(indent: number, specs: string[]) {
  console.log(`${tab(indent)}_arguments -C \\`);

  for (let i = 0; i < specs.length; i++) {
    continuationLine(indent + 1, specs[i], i < specs.length - 1);
  }
}

function emitFlagSpecs(flags: DevKit.DK.Commands.Command["flags"]) {
  const specs: string[] = [];

  for (const flag of flagArray(flags)) {
    const name = clean(flag.name, "").trim();
    if (!name.startsWith("-")) continue;

    const description = zshChoice(clean(flag.description, "option"));

    if (flag.optional) {
      specs.push(zshSingleQuote(`${name}[${description}]`));
    } else {
      specs.push(zshSingleQuote(`${name}=[${description}]:value:`));
    }
  }

  return specs;
}

function commandChoiceSpecs(commands: DevKit.DK.Commands.Command[]) {
  return commands.flatMap(cmd => {
    const names = [cmd.commandName, ...(cmd.aliases ?? [])];
    const description = zshChoice(clean(cmd.description, "command"));

    return names
      .filter(name => name.trim().length > 0)
      .map(name => `${zshChoice(name)}:${description}`);
  });
}

function subcommandChoiceSpecs(subcommands: string[]) {
  return subcommands
    .map(raw => {
      const name = extractSubcommandName(raw);
      if (!name) return null;

      return `${zshChoice(name)}:${zshChoice(clean(raw, "subcommand"))}`;
    })
    .filter((value): value is string => value !== null);
}

export default function GenerateCompletion(
  argv0: string,
  commands: DevKit.DK.Commands.Command[]
) {
  const safeArgv0 = argv0.trim();

  console.log(`#compdef ${safeArgv0}`);
  console.log("");
  console.log("function _dkpm {");
  console.log(`${tab()}local context state line`);
  console.log(`${tab()}typeset -A opt_args`);
  console.log("");

  emitArguments(1, [
    zshSingleQuote("(-h --help)-h[display help]"),
    zshSingleQuote("(-h --help)--help[display help]"),
    zshSingleQuote(`1:command:((${commandChoiceSpecs(commands).join(" ")}))`),
    zshSingleQuote("*::args:->args"),
  ]);

  console.log("");
  console.log(`${tab()}case $state in`);
  console.log(`${tab(2)}args)`);
  console.log(`${tab(3)}case $words[2] in`);

  for (const cmd of commands) {
    const commandNames = [cmd.commandName, ...(cmd.aliases ?? [])]
      .filter(name => name.trim().length > 0)
      .map(zshChoice);

    const subcommands = asArray(cmd.subcommands);
    const subSpecs = subcommandChoiceSpecs(subcommands);
    const flagSpecs = emitFlagSpecs(cmd.flags);

    console.log(`${tab(4)}(${commandNames.join("|")})`);

    const specs: string[] = [...flagSpecs];

    if (subSpecs.length > 0) {
      specs.push(zshSingleQuote(`1:subcommand:((${subSpecs.join(" ")}))`));

      if (cmd.commandName === "fetch") {
        specs.push(
          zshSingleQuote(
            "2:route target:((js:javascript\\ route\\ scaffold javascript:javascript\\ route\\ scaffold c#:c#\\ route\\ scaffold))"
          )
        );
      } else {
        specs.push(zshSingleQuote("*:args:_files"));
      }
    } else {
      specs.push(zshSingleQuote("*:args:_files"));
    }

    emitArguments(5, specs);

    console.log(`${tab(5)};;`);
  }

  console.log(`${tab(4)}(*)`);
  console.log(`${tab(5)}_message ${zshSingleQuote("unknown command")}`);
  console.log(`${tab(5)};;`);
  console.log(`${tab(3)}esac`);
  console.log(`${tab(3)};;`);
  console.log(`${tab()}esac`);
  console.log("}");
  console.log("");
  console.log('_dkpm "$@"');
}
