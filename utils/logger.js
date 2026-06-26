/**
 * Error codes that mean "the network blipped", not "the code is broken".
 * These happen on flaky connections or when a pooled keep-alive socket was
 * closed by the server (undici then fails the next request with 0 bytes).
 */
const TRANSIENT_NETWORK_CODES = new Set([
  'UND_ERR_SOCKET',           // undici: socket closed unexpectedly ("other side closed")
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',                // transient DNS failure
  'ENOTFOUND',
]);

function isTransientNetworkError(error) {
  if (!error) return false;
  if (error.name === 'AbortError') return true; // a request timed out and was aborted
  if (TRANSIENT_NETWORK_CODES.has(error.code)) return true;
  return error.cause ? isTransientNetworkError(error.cause) : false;
}

/**
 * Logs an error, collapsing known-transient network blips to a single warning
 * line while still printing full detail for real bugs.
 * @returns {boolean} true if the error was a transient network issue.
 */
function logError(context, error) {
  if (isTransientNetworkError(error)) {
    console.warn(`[network] ${context}: transient connection issue (${error.code || error.name}) — safe to ignore.`);
    return true;
  }
  console.error(`${context}:`, error);
  return false;
}

module.exports = { isTransientNetworkError, logError };
