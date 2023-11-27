import { requireEnv } from "./src/util";

export const allowedStartDate = new Date("2023-11-24");
export const allowedEndDate = new Date("2023-12-30");

export const berlinCoordinates = {
  latitude: "52°31'12.0\"N",
  longitude: "13°24'17.8\"E",
};
export const homeCoordinates = {
  latitude: "52°31'54.2\"N",
  longitude: "16°40'44.5\"E",
};

export const emailRecipient = requireEnv("EMAIL_RECIPIENT");
