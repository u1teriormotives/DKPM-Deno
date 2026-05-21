/** @format */

import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { stdin } from "node:process";

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
  ): Promise<void> {
    try {
      const Metadata =
        await DevKit.DK.Resolution.dotDkDirectory.GetRouteMetadata();

      const scmds = [...subcommands.values()];
      if (scmds[0] === "router") {
        if (
          (Metadata.routeType !== undefined || Metadata.routeType !== null) &&
          Metadata.routeType === "js" &&
          (Metadata.path !== undefined || Metadata.path !== null)
        ) {
          const s = await stat(Metadata.path);
          if (s.isFile()) {
            const proc = spawn(Metadata.path);
            proc.once("close", code => {
              if (code === 0)
                return Functions.LogSuccess(`returned with ${code}`);
              else return Functions.LogError(`returned ${code}`);
            });
            proc.stdout.on("data", c => Functions.LogStep(`router => ${c}`));
            proc.stderr.on("data", c => Functions.LogError(`router => ${c}`));
            stdin.on("data", d =>
              proc.stdin.write(d, e => Functions.LogError(`router => ${e}`))
            );
          }
        }
      } else {
        Functions.FatalException(100, "unknown command");
      }
    } catch (error) {
      Functions.FatalException(300, String(error));
    }
  },
};
export default RunCommand;
