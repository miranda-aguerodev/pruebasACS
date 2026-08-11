export function formatStatus(value = "") {
  return value
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatPriority(value = "") {
  return value.charAt(0).toUpperCase() + value.slice(1);
}