// Dash — HTML escaping helper.
// Single shared `escapeHtml`, imported by every page script that builds
// markup dynamically, so user-supplied strings are never hand-escaped.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escape a string for safe insertion into HTML text or attribute values.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).replace(/[&<>"']/g, (c) => ESC[c]);
}
