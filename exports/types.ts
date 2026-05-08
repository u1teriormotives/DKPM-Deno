// deno-lint-ignore-file no-namespace
export interface CLIData {
  readonly version: Version;
  readonly cliName: string;
}
export interface EndpointsData {
  readonly js: string[] | string;
  readonly csharp: string[] | string;
}

export namespace Commands {
  export interface Command {
    readonly commandName: string;
    readonly aliases: string[] | undefined | null;
    readonly description: string | null;
    readonly flags: Map<string, FlagType> | FlagType[] | undefined | null;
    readonly subcommands: string[] | null;
    readonly func: (subcommands: string[], flags: Flag[]) => Promise<void>;
  }

  export type Flag = {
    name: string;
    value: string | null;
  };
  type FlagType = {
    name: string;
    optional: boolean;
  };
}

export type Timeperiod = `\x1b[4;94;40mDEVKIT\x1b[0m::\x1b[4;94;40m${
  | number
  | string}:${number | string}\x1b[0m`;
export type Version =
  | `v${number}.${number}.${number}`
  | `v${number}.${number}.${number}-beta`;

export enum FileModes {
  RWE = 0o755,
  RW = 0o644,
}
