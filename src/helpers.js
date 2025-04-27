export const sanitizePrefix = (prefix) =>
  prefix
    .trim()
    .replace(/\/+/g, "/")
    .replace(/(.*?)\/?$/, "$1/")
    .replace(/^\//, "");
