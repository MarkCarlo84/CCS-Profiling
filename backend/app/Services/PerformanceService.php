<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PerformanceService
{
    /**
     * Enable query logging for performance monitoring
     */
    public static function enableQueryLogging(): void
    {
        DB::listen(function ($query) {
            if ($query->time > 100) { // Log queries taking more than 100ms
                Log::warning('Slow Query Detected', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time . 'ms',
                    'connection' => $query->connectionName,
                ]);
            }
        });
    }

    /**
     * Get database performance metrics
     */
    public static function getDatabaseMetrics(): array
    {
        $metrics = [];

        try {
            // Get table sizes
            $tableSizes = DB::select("
                SELECT 
                    table_name,
                    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
                ORDER BY (data_length + index_length) DESC
                LIMIT 10
            ");

            $metrics['table_sizes'] = $tableSizes;

            // Get slow queries (if slow query log is enabled)
            $processlist = DB::select("SHOW PROCESSLIST");
            $metrics['active_connections'] = count($processlist);

            // Get index usage
            $indexUsage = DB::select("
                SELECT 
                    table_name,
                    index_name,
                    cardinality
                FROM information_schema.statistics 
                WHERE table_schema = DATABASE()
                AND cardinality > 0
                ORDER BY cardinality DESC
                LIMIT 20
            ");

            $metrics['index_usage'] = $indexUsage;

        } catch (\Exception $e) {
            Log::error('Failed to get database metrics: ' . $e->getMessage());
            $metrics['error'] = 'Unable to retrieve metrics';
        }

        return $metrics;
    }

    /**
     * Analyze query performance for a specific table
     */
    public static function analyzeTablePerformance(string $table): array
    {
        try {
            $analysis = [];

            // Get table info
            $tableInfo = DB::select("SHOW TABLE STATUS LIKE '{$table}'");
            $analysis['table_info'] = $tableInfo[0] ?? null;

            // Get index information
            $indexes = DB::select("SHOW INDEX FROM {$table}");
            $analysis['indexes'] = $indexes;

            // Suggest optimizations
            $analysis['suggestions'] = self::getOptimizationSuggestions($table, $indexes);

            return $analysis;

        } catch (\Exception $e) {
            Log::error("Failed to analyze table {$table}: " . $e->getMessage());
            return ['error' => 'Analysis failed'];
        }
    }

    /**
     * Get optimization suggestions for a table
     */
    private static function getOptimizationSuggestions(string $table, array $indexes): array
    {
        $suggestions = [];

        // Check for missing indexes on foreign keys
        $foreignKeys = collect($indexes)->where('Key_name', '!=', 'PRIMARY');
        
        if ($foreignKeys->isEmpty()) {
            $suggestions[] = "Consider adding indexes on frequently queried columns for table {$table}";
        }

        // Check for unused indexes (this would require query log analysis)
        $duplicateIndexes = collect($indexes)
            ->groupBy('Column_name')
            ->filter(function ($group) {
                return $group->count() > 1;
            });

        if ($duplicateIndexes->isNotEmpty()) {
            $suggestions[] = "Potential duplicate indexes found on columns: " . 
                $duplicateIndexes->keys()->implode(', ');
        }

        return $suggestions;
    }

    /**
     * Clear all performance-related caches
     */
    public static function clearPerformanceCaches(): void
    {
        // Clear query cache
        try {
            DB::statement('RESET QUERY CACHE');
        } catch (\Exception $e) {
            // Query cache might not be enabled
        }

        // Clear application caches
        \App\Services\CacheService::clearAll();
    }

    /**
     * Get performance recommendations
     */
    public static function getPerformanceRecommendations(): array
    {
        return [
            'database' => [
                'Enable query caching in MySQL configuration',
                'Consider using Redis for session and cache storage',
                'Implement database connection pooling',
                'Regular ANALYZE TABLE maintenance',
            ],
            'application' => [
                'Use eager loading for relationships',
                'Implement pagination on all list endpoints',
                'Cache frequently accessed static data',
                'Use database transactions for bulk operations',
            ],
            'infrastructure' => [
                'Enable OPcache for PHP',
                'Use a CDN for static assets',
                'Implement HTTP/2',
                'Consider database read replicas for reporting',
            ],
        ];
    }
}