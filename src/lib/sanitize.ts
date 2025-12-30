// src/lib/sanitize.ts

/**
 * HTML sanitization utilities
 *
 * Provides functions to escape HTML and prevent XSS attacks in user-generated content.
 * Use these when inserting user data into HTML strings (e.g., export reports).
 */

/**
 * Escape HTML special characters to prevent XSS
 *
 * Converts:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#039;
 *
 * @example
 * escapeHtml("<script>alert('xss')</script>")
 * // Returns: "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;"
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') {
    return String(unsafe);
  }

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Recursively sanitize an object for export
 *
 * Escapes all string values in an object to prevent XSS when generating HTML reports.
 *
 * @example
 * sanitizeForExport({
 *   name: "<script>alert('xss')</script>",
 *   count: 123
 * })
 * // Returns: { name: "&lt;script&gt;...", count: 123 }
 */
export function sanitizeForExport(data: any): any {
  // Handle null/undefined
  if (data == null) {
    return data;
  }

  // Handle strings - escape HTML
  if (typeof data === 'string') {
    return escapeHtml(data);
  }

  // Handle arrays - recursively sanitize each item
  if (Array.isArray(data)) {
    return data.map(sanitizeForExport);
  }

  // Handle objects - recursively sanitize each property
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeForExport(data[key]);
      }
    }
    return sanitized;
  }

  // Handle primitives (numbers, booleans) - return as-is
  return data;
}

/**
 * Sanitize a URL to prevent javascript: protocol attacks
 *
 * @example
 * sanitizeUrl("javascript:alert('xss')")
 * // Returns: "about:blank"
 *
 * sanitizeUrl("https://example.com")
 * // Returns: "https://example.com"
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return 'about:blank';
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return 'about:blank';
    }
  }

  return url;
}

/**
 * Strip HTML tags from a string
 *
 * Useful for creating plain text from HTML content.
 *
 * @example
 * stripHtml("<p>Hello <b>World</b></p>")
 * // Returns: "Hello World"
 */
export function stripHtml(html: string): string {
  if (typeof html !== 'string') {
    return String(html);
  }

  return html.replace(/<[^>]*>/g, '');
}
