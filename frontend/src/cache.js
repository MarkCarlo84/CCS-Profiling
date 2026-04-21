/**
 * Lightweight in-memory request cache.
 *
 * Usage:
 *   import { cached, invalidate, invalidatePrefix } from './cache';
 *
 *   // Cache a GET for 5 minutes
 *   const data = await cached('students?status=active', () => api.get('/students', { params }), 300);
 *
 *   // Bust a specific key
 *   invalidate('reports/summary');
 *
 *   // Bust all keys that start with 'students'
 *   invalidatePrefix('students');
 */

const store = new Map(); // key → { value, expiresAt }

/**
 * Returns cached value if fresh, otherwise calls fetcher, caches and returns result.
 * @param {string} key       - Unique cache key
 * @param {Function} fetcher - Async function that returns the value to cache
 * @param {number} ttl       - Time-to-live in seconds (default 300 = 5 min)
 */
export async function cached(key, fetcher, ttl = 300) {
    const now = Date.now();
    const entry = store.get(key);
    if (entry && entry.expiresAt > now) {
        return entry.value;
    }
    const value = await fetcher();
    store.set(key, { value, expiresAt: now + ttl * 1000 });
    return value;
}

/** Remove a single cache entry. */
export function invalidate(key) {
    store.delete(key);
}

/** Remove all entries whose key starts with the given prefix. */
export function invalidatePrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

/** Clear the entire cache (e.g. on logout). */
export function clearCache() {
    store.clear();
}
