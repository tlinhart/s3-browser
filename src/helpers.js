export const sanitizePrefix = (prefix) =>
  prefix
    .trim()
    .replace(/\/+/g, "/")
    .replace(/(.*?)\/?$/, "$1/")
    .replace(/^\//, "");

export const formatFileSize = (size, digits = 2) => {
  if (size == 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const exp = Math.floor(Math.log(size) / Math.log(1024));
  const converted = parseFloat(size / Math.pow(1024, exp));
  return `${converted.toFixed(digits)} ${units[exp]}`;
};
