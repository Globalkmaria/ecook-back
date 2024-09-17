const removeNestedProperty = (obj, path) => {
  if (!obj || !path || !path.length) return;

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]]) {
      current = current[path[i]];
    } else return;
  }
  delete current[path[path.length - 1]];
};

export const removeProperties = (obj, propertiesToRemove) => {
  let newObj = JSON.parse(JSON.stringify(obj));

  for (let prop of propertiesToRemove) {
    const path = prop.split(".");
    removeNestedProperty(newObj, path);
  }

  return newObj;
};
