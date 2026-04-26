import { useState, useEffect, useCallback, useRef } from 'react';

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(key, params) {
    return params ? `${key}:${JSON.stringify(params)}` : key;
}

function getCached(cacheKey) {
    const cached = cache.get(cacheKey);
    if (!cached) return undefined;
    if (Date.now() - cached.timestamp > CACHE_TTL) {
        cache.delete(cacheKey);
        return undefined;
    }
    return cached.data;
}

function setCache(cacheKey, data) {
    cache.set(cacheKey, { data, timestamp: Date.now() });
}

export function clearCache(key) {
    if (key) {
        // Clear specific key or pattern
        for (const k of cache.keys()) {
            if (k.startsWith(key)) cache.delete(k);
        }
    } else {
        cache.clear();
    }
}

/**
 * Warm the cache directly (used for prefetching after login).
 */
export function warmCache(key, data, params = null) {
    setCache(getCacheKey(key, params), data);
}

// Hook for data fetching with caching
export function useQuery(key, fetcher, options = {}) {
    const {
        params = null,
        enabled = true,
    } = options;

    // Stable string key for cache — avoids object reference issues
    const cacheKey = getCacheKey(key, params);

    // Initialize directly from cache if available — zero-flicker on revisit
    const [data, setData] = useState(() => getCached(cacheKey) ?? null);
    const [loading, setLoading] = useState(() => getCached(cacheKey) === undefined);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    // Keep fetcher ref stable so it doesn't trigger re-runs
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const refetch = useCallback(async (skipCache = false) => {
        if (!enabled) return;

        // Serve from cache when available and not explicitly skipped
        if (!skipCache) {
            const cached = getCached(cacheKey);
            if (cached !== undefined) {
                setData(cached);
                setLoading(false);
                return cached;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetcherRef.current(params);
            const responseData = result?.data ?? result;

            if (mountedRef.current) {
                setData(responseData);
                setCache(cacheKey, responseData);
            }

            return responseData;
        } catch (err) {
            if (mountedRef.current) {
                setError(err);
            }
            throw err;
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    // Only re-run when the cache key or enabled flag changes — not on fetcher identity changes
    }, [cacheKey, enabled, params]);

    useEffect(() => {
        mountedRef.current = true;
        // If cache already hydrated the state, still do a background fetch
        // only if there's no cached data (cold start)
        const cached = getCached(cacheKey);
        if (cached === undefined) {
            refetch();
        }
        return () => { mountedRef.current = false; };
    }, [refetch, cacheKey]);

    return { data, loading, error, refetch };
}

// Hook for mutations with cache invalidation
export function useMutation(mutationFn, options = {}) {
    const { onSuccess, onError, invalidateKeys = [] } = options;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = useCallback(async (variables) => {
        setLoading(true);
        setError(null);

        try {
            const result = await mutationFn(variables);
            const responseData = result?.data ?? result;

            // Invalidate cache keys
            invalidateKeys.forEach(key => clearCache(key));

            onSuccess?.(responseData, variables);
            return responseData;
        } catch (err) {
            setError(err);
            onError?.(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [mutationFn, onSuccess, onError, invalidateKeys]);

    return { mutate, loading, error };
}
