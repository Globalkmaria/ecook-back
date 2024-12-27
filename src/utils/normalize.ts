export const convertSpacesToDashes = (text: string) =>
  text.replace(/\s+/g, "-").replace(/-+/g, "-");

export const splitString = (
  input: string | undefined | null,
  delimiter: string = ","
): string[] => input?.split(delimiter) || [];

export const lightSlugify = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-");

export const lightTrim = (text: string) => text.trim().replace(/\s+/g, " ");

export const replaceHyphensWithSpaces = (text: string) =>
  text.replace(/-/g, " ");
