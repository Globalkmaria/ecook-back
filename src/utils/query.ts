export const arrayToPlaceholders = <T extends number | string>(array: T[]) =>
  array.map(() => "?").join(", ");
