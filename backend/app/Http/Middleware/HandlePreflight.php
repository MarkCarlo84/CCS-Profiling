<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HandlePreflight
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->isMethod('OPTIONS')) {
            return response()->json([], 200, [
                'Access-Control-Allow-Origin'  => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept, X-Requested-With',
            ]);
        }

        return $next($request);
    }
}
