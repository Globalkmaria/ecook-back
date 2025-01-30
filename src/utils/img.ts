import { config } from "../config/index.js";

export function getImgUrl(
  img?: string | null,
  needDefaultValue?: false
): string | null;
export function getImgUrl(img?: string | null, needDefaultValue?: true): string;
export function getImgUrl(
  img?: string | null,
  needDefaultValue?: boolean
): string | null {
  return img ? config.img.dbUrl + img : needDefaultValue ? "" : null;
}

export const IMG_DB_URL = config.img.dbUrl;
