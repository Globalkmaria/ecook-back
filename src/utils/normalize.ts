export const convertSpacesToDashes = (text: string) =>
  text.replace(/\s+/g, "-").replace(/-+/g, "-");

export const splitString = (
  input: string | undefined | null,
  delimiter: string = ","
): string[] => {
  return input?.split(delimiter) || [];
};

export const lightSlugify = (text: string) => {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/-+/g, "-");
};
