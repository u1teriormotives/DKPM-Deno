/** @format */

import { writeFile } from "node:fs/promises";
import process from "node:process";

import * as DK from "./typing.ts";

export function GetTime(): DK.Timeperiod {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  return `\x1b[4;94;40mDEVKIT\x1b[0m::\x1b[4;94;40m${
    hours < 10 ? `0${hours}` : hours
  }:${minutes < 10 ? `0${minutes}` : minutes}\x1b[0m`;
}
export function FatalException(code: number | string, message: string): void {
  console.error(`\x1b[1;41;37mFATAL EXCEPTION\x1b[0m
${GetTime()} -> code ${code}
${message}`);
  process.exit(1);
}
export function NonfatalException(
  code: number | string,
  message: string
): void {
  console.error(`\x1b[1;47;34mNONFATAL EXCEPTION\x1b[0m
${GetTime()} -> code ${code}
${message}`);
}

export async function FetchEndpoint(
  endpoint: Readonly<string>,
  filepath: string,
  headers: object | undefined,
  mode: DK.DK.FileMode
): Promise<void> {
  if (endpoint === "null")
    return FatalException(0xf0000 | 404, "resource does not exist");

  console.log(`${GetTime()} -> attempting to GET resource @ ${endpoint}`);
  const req = await fetch(endpoint, {
    method: "GET",
    headers: headers ?? {},
  });

  console.log(`${GetTime()} -> request has returned (code: ${req.status})`);
  if (req.status !== 200)
    return FatalException(
      0xf0000 | req.status,
      `failed to GET resource; is the server online?`
    );

  const data = await req.text();
  try {
    console.log(`${GetTime()} -> attempting to write body to ${filepath}`);
    await writeFile(filepath, data, { encoding: "utf8", mode });
    return console.log(
      `${GetTime()} -> written file to ${filepath} & set filemode to ${mode}`
    );
  } catch (_error) {
    return FatalException(100, "cannot write file; do you have permission?");
  }
}
