const DEFAULT_TIMEOUT = 15000; // 15s

/**
 * Fetch with timeout and simple retry.
 * @param {string} url
 * @param {RequestInit} opts
 * @param {number} retries number of additional attempts
 * @param {number} timeoutMs per-attempt timeout
 */
async function safeFetch(url, opts = {}, retries = 2, timeoutMs = DEFAULT_TIMEOUT) {
  let attempt = 0;
  while (true) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(id);
      if (res.ok) return res;
      if (retries === 0) return res; // propagate last bad response
    } catch (err) {
      if (retries === 0) throw err;
    }
    attempt += 1;
    retries -= 1;
    // exponential backoff
    await new Promise(r => setTimeout(r, 1000 * attempt));
  }
}

module.exports = { safeFetch }; 