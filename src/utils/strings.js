/**
 * String utility helpers for name conversions.
 */

/**
 * Convert a name to PascalCase (e.g. "user-profile" => "UserProfile")
 * @param {string} str
 * @returns {string}
 */
export function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

/**
 * Convert a name to camelCase (e.g. "UserProfile" => "userProfile")
 * @param {string} str
 * @returns {string}
 */
export function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert a name to kebab-case (e.g. "UserProfile" => "user-profile")
 * @param {string} str
 * @returns {string}
 */
export function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
