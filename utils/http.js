const { request: undiciRequest } = require('undici');
const { isTransientNetworkError } = require('./logger');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Drop-in replacement for undici's `request` that automatically retries on
 * transient network errors (e.g. a stale keep-alive socket the server already
 * closed — "other side closed"). Each attempt gets a fresh connection, so a
 * single retry recovers the vast majority of these blips.
 *
 * Only use this for idempotent (GET) requests — every call here is a safe read.
 *
 * @param {string|URL} url
 * @param {object} [options] undici request options (method, headers, body, ...)
 * @param {object} [retryOptions]
 * @param {number} [retryOptions.retries=2] extra attempts after the first.
 * @param {number} [retryOptions.retryDelay=300] base backoff in ms (grows per attempt).
 */
async function request(url, options = {}, { retries = 2, retryDelay = 300 } = {}) {
  // Fail fast (and then retry) instead of hanging on a dead connection.
  const requestOptions = { headersTimeout: 15_000, bodyTimeout: 15_000, ...options };

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await undiciRequest(url, requestOptions);
    } catch (error) {
      lastError = error;
      if (!isTransientNetworkError(error) || attempt === retries) throw error;
      await sleep(retryDelay * (attempt + 1));
    }
  }
  throw lastError;
}

module.exports = { request };
