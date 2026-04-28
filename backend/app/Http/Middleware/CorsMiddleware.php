<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request and add CORS headers to all responses
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS requests immediately
        if ($request->isMethod('OPTIONS')) {
            return $this->createOptionsResponse();
        }

        // Process the request
        $response = $next($request);

        // Add CORS headers to all responses
        $this->addCorsHeaders($response);

        return $response;
    }

    /**
     * Create OPTIONS response for preflight requests
     */
    private function createOptionsResponse(): Response
    {
        $response = response()->json([], 200);
        $this->addCorsHeaders($response);
        return $response;
    }

    /**
     * Add CORS headers to response
     */
    private function addCorsHeaders(Response $response): void
    {
        $headers = [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept, X-Requested-With, X-CSRF-TOKEN, Origin',
            'Access-Control-Allow-Credentials' => 'false',
            'Access-Control-Max-Age' => '86400',
            'Access-Control-Expose-Headers' => 'Content-Length, Content-Type',
        ];

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value, false);
        }
    }
}