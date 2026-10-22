/** Case-insensitive exact email match for MongoDB queries. */
export function emailMatchRegex(email) {
  return new RegExp(
    `^${String(email).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i"
  );
}
