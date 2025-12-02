import { Constants } from "@/config/Constants";
import { IZXCVBNResult } from "zxcvbn-typescript";

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
