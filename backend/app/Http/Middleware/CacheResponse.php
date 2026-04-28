<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, int $minutes = 5): Response
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Create cache key from request
        $cacheKey = $this->getCacheKey($request);

        // Return cached response if exists
        if (Cache::has($cacheKey)) {
            $cachedResponse = Cache::get($cacheKey);
            return response($cachedResponse['content'], $cachedResponse['status'])
                ->withHeaders($cachedResponse['headers'])
                ->header('X-Cache', 'HIT');
        }

        // Process request
        $response = $next($request);

        // Cache successful responses
        if ($response->getStatusCode() === 200) {
            $cacheData = [
                'content' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => $response->headers->all(),
            ];

            Cache::put($cacheKey, $cacheData, now()->addMinutes($minutes));
            $response->header('X-Cache', 'MISS');
        }

        return $response;
    }

    /**
     * Generate cache key from request
     */
    private function getCacheKey(Request $request): string
    {
        $key = 'response_cache:' . md5($request->fullUrl() . serialize($request->query()));
        
        // Include user context for personalized responses
        if ($request->user()) {
            $key .= ':user:' . $request->user()->id;
        }

        return $key;
    }
}