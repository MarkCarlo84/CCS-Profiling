<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class OptimizeResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only optimize GET requests
        if (!$request->isMethod('GET')) {
            return $response;
        }

        // Add performance headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // Add CORS headers for all responses
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');

        // Add caching headers for static-like API endpoints
        if ($this->shouldCache($request)) {
            $response->headers->set('Cache-Control', 'public, max-age=300'); // 5 minutes
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s \G\M\T', time() + 300));
        }

        // Compress response if possible
        if ($this->shouldCompress($request, $response)) {
            $content = $response->getContent();
            if (function_exists('gzencode') && strlen($content) > 1024) {
                $compressed = gzencode($content, 6);
                if ($compressed !== false && strlen($compressed) < strlen($content)) {
                    $response->setContent($compressed);
                    $response->headers->set('Content-Encoding', 'gzip');
                    $response->headers->set('Content-Length', strlen($compressed));
                }
            }
        }

        return $response;
    }

    /**
     * Determine if the request should be cached
     */
    private function shouldCache(Request $request): bool
    {
        $cachableRoutes = [
            'api/departments',
            'api/subjects',
            'api/faculties',
            'api/courses',
            'api/rooms',
        ];

        $path = $request->path();
        
        foreach ($cachableRoutes as $route) {
            if (str_starts_with($path, $route)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine if the response should be compressed
     */
    private function shouldCompress(Request $request, Response $response): bool
    {
        // Check if client accepts gzip
        $acceptEncoding = $request->header('Accept-Encoding', '');
        if (!str_contains($acceptEncoding, 'gzip')) {
            return false;
        }

        // Check content type
        $contentType = $response->headers->get('Content-Type', '');
        $compressibleTypes = [
            'application/json',
            'text/html',
            'text/css',
            'text/javascript',
            'application/javascript',
        ];

        foreach ($compressibleTypes as $type) {
            if (str_contains($contentType, $type)) {
                return true;
            }
        }

        return false;
    }
}