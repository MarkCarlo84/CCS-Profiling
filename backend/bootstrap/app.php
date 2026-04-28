<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: ['api/*']);
        // Add comprehensive CORS handling for ALL requests (web and api)
        $middleware->web(prepend: \App\Http\Middleware\CorsMiddleware::class);
        $middleware->api(prepend: \App\Http\Middleware\CorsMiddleware::class);
        // Add API error handler for consistent error responses
        $middleware->api(append: \App\Http\Middleware\ApiErrorHandler::class);
        // Trust all proxies (needed for Render/Cloudflare)
        $middleware->trustProxies(at: '*');
        // Role-based access control
        $middleware->alias(['role' => \App\Http\Middleware\RoleMiddleware::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response) {
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
            return $response;
        });
    })->create();
