/** @format */

import * as DevKit from "./typing.ts";

export default function GenerateCompletion(
  argv0: string,
  commands: DevKit.DK.Commands.Command[]
) {
  function tab(indents: number | undefined) {
    if (indents) return "  ".repeat(indents < 1 ? 1 : indents);
    else return "  ";
  }
  // compdef stuff
  console.log(`#compdef _dkpm ${argv0}\n`);
  console.log("function _dkpm {"); // begin

  console.log(`${tab(1)}local line\n`);
  console.log(`${tab(1)}_arguments -C \\`);
  console.log(`${tab(2)}help, -h, --help => display help \\`);
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd.aliases && cmd.aliases.length > 0) {
      console.log(
        `${tab(2)}${cmd.commandName}, ${cmd.aliases.concat(", ")} => ${cmd.description} ${
          i < commands.length - 1 ? "\\" : ""
        }`
      );
    } else
      console.log(
        `${tab(2)}${cmd.commandName} => ${cmd.description} ${i < commands.length - 1 ? "\\" : ""}`
      );
  }
  console.log("}"); // end primary function
}
