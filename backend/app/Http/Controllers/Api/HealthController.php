<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        try {
            $dbConnection = \DB::connection()->getPdo() ? 'connected' : 'disconnected';
        } catch (\Exception $e) {
            $dbConnection = 'error: ' . $e->getMessage();
        }

        try {
            $tableCount = \DB::select("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()")[0]->count ?? 0;
        } catch (\Exception $e) {
            $tableCount = 'error';
        }

        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'environment' => app()->environment(),
            'database' => $dbConnection,
            'tables' => $tableCount,
            'cache_store' => config('cache.default'),
            'cors_test' => 'This endpoint should have CORS headers',
            'request_origin' => request()->header('Origin'),
            'request_method' => request()->method(),
        ]);
    }
}