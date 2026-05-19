/** @format */
// deno-lint-ignore-file no-namespace

import { Resolution as res } from "./resolution.ts";

export type CLIData = {
  name: Readonly<string>;
  version:
    | `v${number}.${number}.${number}`
    | `v${number}.${number}.${number}-beta`;
};
export type Timeperiod = `\x1b[4;94;40mDEVKIT\x1b[0m::\x1b[4;94;40m${
  | number
  | string}:${number | string}\x1b[0m`;
export type Version =
  | `v${number}.${number}.${number}`
  | `v${number}.${number}.${number}-beta`;

export namespace DK {
  export namespace Commands {
    export interface Command {
      readonly commandName: string;
      readonly aliases: string[] | undefined | null;
      readonly description: string | undefined | null;
      readonly flags: Map<string, FlagType> | FlagType[] | undefined | null;
      readonly subcommands: Set<string> | string[] | undefined | null;
      readonly commandFunction: (
        subcommands: Set<string>,
        flags: Map<string, Flag>
      ) => Promise<void>;
    }

    export type Flag = {
      readonly name: string;
      readonly value: string | null;
    };
    type FlagType = {
      readonly name: string;
      readonly optional: boolean;
    };
  }

  export const Resolution = res;
}
