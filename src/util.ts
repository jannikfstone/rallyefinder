import fs from "fs";

export function requireEnv(variableName): string {
  const envValue = process.env[variableName];
  if (!envValue) {
    throw new Error("Required env variable " + variableName + " is not set");
  }
  return envValue;
}
export function writeFileConditional(filename: string, content: string) {
  if (!fs.existsSync(`${__dirname}/out`)) {
    fs.mkdirSync(`${__dirname}/out`);
  }
  if (process.env.WRITE_JSON === "true") {
    fs.writeFileSync(filename, content);
  }
}
