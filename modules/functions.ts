/** @format */

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
