export const arrayToPlaceholders = <T extends any>(array: T[]) =>
  Array(array.length)
    .fill(1)
    .map(() => "?")
    .join(", ");
