const toCamelCase = (str) => {
  if (str === "_id") return "docId";
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace(/[-_]/g, "")
  );
};

export const keysToCamelCase = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        keysToCamelCase(value),
      ])
    );
  }
  return obj;
};
