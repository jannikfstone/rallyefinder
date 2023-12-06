import { AxiosError, AxiosRequestConfig } from "axios";
import fs from "fs";

export function requireEnv(variableName): string {
  const envValue = process.env[variableName];
  if (!envValue) {
    throw new Error("Required env variable " + variableName + " is not set");
  }
  return envValue;
}
export function writeFileConditional(filename: string, content: {}) {
  if (process.env.WRITE_JSON !== "true") {
    return;
  }
  if (!fs.existsSync(`out`)) {
    fs.mkdirSync(`out`);
  }
  fs.writeFileSync(`out/${filename}`, JSON.stringify(content, undefined, 2));
}

export function onRetry(
  retryCount: number,
  error: AxiosError,
  requestConfig: AxiosRequestConfig
) {
  let logString = `retry no ${retryCount} for URL ${requestConfig.url}`;
  if (error.response?.status === 429) {
    logString += ` Error 429`;
  }
  console.log(logString);
  return;
}

export function customDelay(retryCount: number, error: AxiosError): number {
  if (error.response?.status === 429) {
    return 500 * 2 ** retryCount + Math.random() * 500;
  }
  return 0;
}
