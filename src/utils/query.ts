export const arrayToPlaceholders = <T>(array: T[]) =>
  Array(array.length)
    .fill(1)
    .map(() => "?")
    .join(", ");
