export const getIsObjectWithFunctions = (maybeObject: unknown) => {
  if (maybeObject === null) {
    return false;
  }
  if (typeof maybeObject === 'function') {
    return false;
  }
  if (Object(maybeObject) === maybeObject) {
    const values = Object.values(maybeObject as {});
    if (values[0] && typeof values[0] === 'function') {
      return true;
    }
  }
  return false;
};
