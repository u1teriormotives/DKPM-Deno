/** @format */

import * as Functions from "../modules/functions.ts";
import * as DevKit from "../modules/typing.ts";

export const RunCommand: DevKit.DK.Commands.Command = {
  commandName: "run",
  aliases: undefined,
  description: "Run a DevKit module",
  subcommands: ["router"],
  flags: undefined,
  commandFunction: async function (
    subcommands: Set<string>,
    flags: Map<string, DevKit.DK.Commands.Flag>
  ): Promise<void> {},
};
export default RunCommand;
