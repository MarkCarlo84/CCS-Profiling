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
        // Handle OPTIONS preflight before anything else
        $middleware->prepend(\App\Http\Middleware\HandlePreflight::class);
        // CORS must be global so OPTIONS preflight requests are handled
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        // Add response optimization middleware for API routes
        $middleware->api(append: \App\Http\Middleware\OptimizeResponse::class);
        // Trust all proxies (needed for Render/Cloudflare)
        $middleware->trustProxies(at: '*');
        // Role-based access control
        $middleware->alias(['role' => \App\Http\Middleware\RoleMiddleware::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
