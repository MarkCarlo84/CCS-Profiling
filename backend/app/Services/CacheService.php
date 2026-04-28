<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\Faculty;
use App\Models\Subject;
use App\Models\Department;

class CacheService
{
    /**
     * Cache duration in seconds
     */
    const CACHE_DURATION = [
        'short' => 300,   // 5 minutes
        'medium' => 1800, // 30 minutes  
        'long' => 3600,   // 1 hour
        'daily' => 86400, // 24 hours
    ];

    /**
     * Get cached faculty list for dropdowns
     */
    public static function getFacultyList(): \Illuminate\Support\Collection
    {
        return Cache::remember('faculty_list', self::CACHE_DURATION['medium'], function () {
            return Faculty::select('id', 'faculty_id', 'first_name', 'last_name', 'department', 'position')
                ->orderBy('last_name')
                ->get();
        });
    }

    /**
     * Get cached subjects grouped by program/year/semester
     */
    public static function getSubjectsByProgram(): \Illuminate\Support\Collection
    {
        return Cache::remember('subjects_by_program', self::CACHE_DURATION['long'], function () {
            return Subject::select('id', 'subject_name', 'year_level', 'semester', 'program', 'units', 'pre_requisite')
                ->get()
                ->groupBy(['program', 'year_level', 'semester']);
        });
    }

    /**
     * Get cached department list
     */
    public static function getDepartments(): \Illuminate\Support\Collection
    {
        return Cache::remember('departments_list', self::CACHE_DURATION['daily'], function () {
            return Department::select('id', 'name', 'code')->get();
        });
    }

    /**
     * Get cached dashboard summary stats
     */
    public static function getDashboardSummary(): array
    {
        return Cache::remember('dashboard_summary', self::CACHE_DURATION['short'], function () {
            return [
                'total_faculty' => Faculty::count(),
                'total_students' => \App\Models\Student::count(),
                'active_students' => \App\Models\Student::where('status', 'active')->count(),
                'total_subjects' => Subject::count(),
                'total_violations' => \App\Models\Violation::count(),
                'by_gender' => \App\Models\Student::selectRaw('gender, count(*) as count')
                    ->groupBy('gender')
                    ->pluck('count', 'gender'),
            ];
        });
    }

    /**
     * Get cached preset data for reports
     */
    public static function getReportPresets(): array
    {
        return Cache::remember('report_presets', self::CACHE_DURATION['medium'], function () {
            return [
                'skills' => \App\Models\Skill::select('skill_name')
                    ->distinct()
                    ->orderBy('skill_name')
                    ->pluck('skill_name'),
                'affiliations' => \App\Models\Affiliation::select('name')
                    ->whereNotNull('name')
                    ->distinct()
                    ->orderBy('name')
                    ->pluck('name'),
            ];
        });
    }

    /**
     * Clear all cached data
     */
    public static function clearAll(): void
    {
        $keys = [
            'faculty_list',
            'subjects_by_program', 
            'departments_list',
            'dashboard_summary',
            'report_presets'
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Clear specific cache by key
     */
    public static function clear(string $key): void
    {
        Cache::forget($key);
    }

    /**
     * Invalidate cache when data changes
     */
    public static function invalidateOnDataChange(string $model): void
    {
        switch ($model) {
            case 'Faculty':
                Cache::forget('faculty_list');
                Cache::forget('dashboard_summary');
                break;
            case 'Student':
                Cache::forget('dashboard_summary');
                break;
            case 'Subject':
                Cache::forget('subjects_by_program');
                Cache::forget('dashboard_summary');
                break;
            case 'Skill':
            case 'Affiliation':
                Cache::forget('report_presets');
                break;
        }
    }
}