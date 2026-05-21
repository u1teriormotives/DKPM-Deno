/** @format */
// deno-lint-ignore-file no-namespace
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import p from "node:path";

import * as Functions from "./functions.ts";
import * as DevKit from "./typing.ts";
import path from "node:path";

export namespace Resolution {
  export function resolveEndpoint(EndpointName: string): Readonly<string> {
    switch (EndpointName) {
      case "apikey":
      case "keygen":
        return "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Libraries/APIKeyGenerator.c";
      case "dkroute":
        return "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Routing/DKRoute.json";
      case "index.html":
        return "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Routing/generic_index.html";
      case "route-js":
        return "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/Routing/JavaScript/index.js";
      case "prettierrc":
        return "https://github.com/u1teriormotives/DevKit-Pastes/raw/refs/heads/main/.prettierrc";
      case "clang-format":
        return "https://github.com/u1teriormotives/DevKit-Pastes/raw/refs/heads/main/.clang-format";
    }
    return "https://github.com/u1teriormotives/DevKit/raw/refs/heads/main/README.md";
  }

  export namespace dotDkDirectory {
    export async function SetUpDirectory(): Promise<
      boolean | [boolean, Error]
    > {
      try {
        const s = await stat(".dk");

        if (s.isDirectory()) return true;
        else if (s.isFile()) {
          Functions.FatalException(
            400,
            ".dk is a file, not a directory! You must remedy this manually"
          );
        }

        await mkdir(".dk");

        return true;
      } catch (error) {
        return [false, error as Error];
      }
    }
    export async function SetUpRouteMetadata(
      routeType: DevKit.DK.RouteType,
      path: string
    ): Promise<boolean | [boolean, Error]> {
      try {
        const data = {
          routeType: "",
          path: "",
        };
        if (routeType === DevKit.DK.RouteType.JavaScript) {
          data.routeType = "js";
          const s = await stat(path);
          const s2 = await stat(".dk");
          if (!s.isFile() || !s2.isDirectory()) {
            Functions.FatalException(400, "invalid path setup try again");
          }
          data.path = path;

          await writeFile(
            p.join(".dk", "routeConfig.json"),
            JSON.stringify(data),
            "utf8"
          );
        } else if (routeType === DevKit.DK.RouteType.CSharp) {
          data.routeType = "cs";
          data.path = path; // Add in more extensive tests later when build command is introduced

          await writeFile(
            p.join(".dk", "routeConfig.json"),
            JSON.stringify(data),
            "utf8"
          );
        }
        return true;
      } catch (error) {
        return false;
      }
    }
    async function GetRouteMetadataAsString(): Promise<string | Error> {
      try {
        const data = await readFile(
          path.join(".dk", "routeConfig.json"),
          "utf8"
        );
        return data;
      } catch (error) {
        return error as Error;
      }
    }
    // deno-lint-ignore no-explicit-any
    export async function GetRouteMetadata(): Promise<any | Error> {
      try {
        const mdata = await GetRouteMetadataAsString();
        if (mdata instanceof Error) return mdata;
        return JSON.parse(mdata as string);
      } catch (error) {
        return error as Error;
      }
    }
  }
}
