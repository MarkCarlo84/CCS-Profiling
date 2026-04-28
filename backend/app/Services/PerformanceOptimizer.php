<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Subject;

class PerformanceOptimizer
{
    /**
     * Cache durations for different data types
     */
    const CACHE_DURATIONS = [
        'static' => 86400,    // 24 hours for rarely changing data
        'dynamic' => 3600,    // 1 hour for frequently changing data
        'realtime' => 30,     // 30 seconds for real-time data
    ];

    /**
     * Get optimized student list with minimal data for dropdowns/lists
     */
    public static function getStudentList(array $filters = []): array
    {
        $cacheKey = 'student_list_' . md5(serialize($filters));
        
        return Cache::remember($cacheKey, self::CACHE_DURATIONS['dynamic'], function () use ($filters) {
            $query = Student::select('id', 'student_id', 'first_name', 'last_name', 'status', 'department');
            
            // Apply filters
            foreach ($filters as $field => $value) {
                if (!empty($value)) {
                    $query->where($field, $value);
                }
            }
            
            return $query->orderBy('last_name')->get()->toArray();
        });
    }

    /**
     * Get optimized faculty list
     */
    public static function getFacultyList(): array
    {
        return Cache::remember('faculty_list_optimized', self::CACHE_DURATIONS['static'], function () {
            return Faculty::select('id', 'faculty_id', 'first_name', 'last_name', 'department', 'position')
                ->orderBy('last_name')
                ->get()
                ->toArray();
        });
    }

    /**
     * Get dashboard statistics with heavy caching
     */
    public static function getDashboardStats(): array
    {
        return Cache::remember('dashboard_stats', self::CACHE_DURATIONS['realtime'], function () {
            return [
                'students' => [
                    'total' => Student::count(),
                    'active' => Student::where('status', 'active')->count(),
                    'by_department' => Student::select('department', DB::raw('count(*) as count'))
                        ->groupBy('department')
                        ->pluck('count', 'department')
                        ->toArray(),
                    'by_year' => Student::select('year_level', DB::raw('count(*) as count'))
                        ->groupBy('year_level')
                        ->pluck('count', 'year_level')
                        ->toArray(),
                ],
                'faculty' => [
                    'total' => Faculty::count(),
                    'by_department' => Faculty::select('department', DB::raw('count(*) as count'))
                        ->groupBy('department')
                        ->pluck('count', 'department')
                        ->toArray(),
                ],
                'subjects' => [
                    'total' => Subject::count(),
                    'by_program' => Subject::select('program', DB::raw('count(*) as count'))
                        ->groupBy('program')
                        ->pluck('count', 'program')
                        ->toArray(),
                ],
            ];
        });
    }

    /**
     * Preload commonly accessed data
     */
    public static function warmupCache(): void
    {
        // Warm up frequently accessed caches
        self::getFacultyList();
        self::getDashboardStats();
        self::getStudentList();
        
        // Warm up department and subject caches
        CacheService::getDepartments();
        CacheService::getSubjectsByProgram();
    }

    /**
     * Clear performance caches when data changes
     */
    public static function invalidateCache(string $type = 'all'): void
    {
        $patterns = [
            'student' => ['student_list_*', 'dashboard_stats'],
            'faculty' => ['faculty_list_*', 'dashboard_stats'],
            'subject' => ['subjects_*', 'dashboard_stats'],
            'all' => ['student_list_*', 'faculty_list_*', 'dashboard_stats', 'subjects_*'],
        ];

        $keys = $patterns[$type] ?? $patterns['all'];
        
        foreach ($keys as $key) {
            if (str_contains($key, '*')) {
                // For wildcard patterns, we'd need to implement cache tag support
                // For now, just clear the main keys
                Cache::forget(str_replace('*', 'optimized', $key));
            } else {
                Cache::forget($key);
            }
        }
    }

    /**
     * Get optimized paginated results
     */
    public static function getPaginatedStudents(array $filters = [], int $perPage = 20): array
    {
        // Don't cache paginated results as they change frequently
        $query = Student::select('id', 'student_id', 'first_name', 'last_name', 'status', 'department', 'year_level', 'gender');
        
        // Apply filters efficiently
        foreach ($filters as $field => $value) {
            if (!empty($value) && $field !== 'search') {
                $query->where($field, $value);
            }
        }
        
        // Handle search separately for better performance
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name', 'like', "%$search%")
                  ->orWhere('student_id', 'like', "%$search%");
            });
        }
        
        return $query->orderBy('last_name')->paginate($perPage)->toArray();
    }
}