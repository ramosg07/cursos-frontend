import { Constants } from "@/config/Constants";
import { IZXCVBNResult } from "zxcvbn-typescript";
import packageJson from "../../package.json";

export const siteName = () => {
  return Constants.siteName ?? "";
};

export const encodeBase64 = (data: string) => {
  return Buffer.from(data).toString("base64");
};

export const securityPassword = async (
  pass: string
): Promise<IZXCVBNResult> => {
  const zxcvbnLib = (await import("zxcvbn-typescript")).default;
  return zxcvbnLib(pass);
};

export const capitalizeFirstLetter = (string: string) =>
  string
    .split("")
    .map((char, index) => (index === 0 ? char.toUpperCase() : char))
    .join("");

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const versionNumber = () => {
  return packageJson.version;
};

export const nombrePropio = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
