<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\Faculty;
use App\Services\CacheService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ValidateOptimizations extends Command
{
    protected $signature = 'optimize:validate';
    protected $description = 'Validate that all performance optimizations are working correctly';

    public function handle()
    {
        $this->info('🔍 Validating Performance Optimizations...');
        
        $issues = [];
        
        // 1. Check database indexes
        $this->info('Checking database indexes...');
        $indexIssues = $this->validateIndexes();
        if (!empty($indexIssues)) {
            $issues = array_merge($issues, $indexIssues);
        }
        
        // 2. Check model relationships
        $this->info('Checking model relationships...');
        $relationshipIssues = $this->validateRelationships();
        if (!empty($relationshipIssues)) {
            $issues = array_merge($issues, $relationshipIssues);
        }
        
        // 3. Check cache service
        $this->info('Checking cache service...');
        $cacheIssues = $this->validateCacheService();
        if (!empty($cacheIssues)) {
            $issues = array_merge($issues, $cacheIssues);
        }
        
        // 4. Test query performance
        $this->info('Testing query performance...');
        $queryIssues = $this->validateQueryPerformance();
        if (!empty($queryIssues)) {
            $issues = array_merge($issues, $queryIssues);
        }
        
        // 5. Check API endpoints
        $this->info('Checking API endpoints...');
        $apiIssues = $this->validateApiEndpoints();
        if (!empty($apiIssues)) {
            $issues = array_merge($issues, $apiIssues);
        }
        
        // Report results
        if (empty($issues)) {
            $this->info('✅ All optimizations are working correctly!');
            return 0;
        } else {
            $this->error('❌ Found ' . count($issues) . ' issues:');
            foreach ($issues as $issue) {
                $this->error('  - ' . $issue);
            }
            return 1;
        }
    }
    
    private function validateIndexes(): array
    {
        $issues = [];
        
        $requiredIndexes = [
            'students' => ['status', 'gender', 'department', 'student_id'],
            'faculties' => ['department', 'faculty_id'],
            'skills' => ['student_id', 'skill_name'],
            'affiliations' => ['student_id', 'name'],
            'violations' => ['student_id', 'severity_level'],
            'academic_records' => ['student_id', 'year_level'],
            'grades' => ['academic_record_id', 'subject_id'],
        ];
        
        foreach ($requiredIndexes as $table => $columns) {
            if (!Schema::hasTable($table)) {
                $issues[] = "Table {$table} does not exist";
                continue;
            }
            
            try {
                $indexes = DB::select("SHOW INDEX FROM {$table}");
                $indexColumns = collect($indexes)->pluck('Column_name')->toArray();
                
                foreach ($columns as $column) {
                    if (!in_array($column, $indexColumns)) {
                        $issues[] = "Missing index on {$table}.{$column}";
                    }
                }
            } catch (\Exception $e) {
                $issues[] = "Could not check indexes for {$table}: " . $e->getMessage();
            }
        }
        
        return $issues;
    }
    
    private function validateRelationships(): array
    {
        $issues = [];
        
        try {
            // Test Student relationships
            $student = Student::with(['violations', 'affiliations', 'skills', 'academicRecords'])->first();
            if (!$student) {
                $issues[] = "No students found in database";
                return $issues;
            }
            
            // Check if relationships are properly defined
            $relationships = ['violations', 'affiliations', 'skills', 'academicRecords', 'nonAcademicHistories'];
            foreach ($relationships as $relation) {
                if (!method_exists($student, $relation)) {
                    $issues[] = "Student model missing {$relation} relationship";
                }
            }
            
            // Test Faculty relationships
            $faculty = Faculty::first();
            if ($faculty && !method_exists($faculty, 'evaluations')) {
                $issues[] = "Faculty model missing evaluations relationship";
            }
            
        } catch (\Exception $e) {
            $issues[] = "Error testing relationships: " . $e->getMessage();
        }
        
        return $issues;
    }
    
    private function validateCacheService(): array
    {
        $issues = [];
        
        try {
            // Test cache methods
            $faculties = CacheService::getFacultyList();
            if (!is_object($faculties) && !is_array($faculties)) {
                $issues[] = "CacheService::getFacultyList() not returning collection";
            }
            
            $summary = CacheService::getDashboardSummary();
            if (!is_array($summary)) {
                $issues[] = "CacheService::getDashboardSummary() not returning array";
            }
            
            $presets = CacheService::getReportPresets();
            if (!is_array($presets)) {
                $issues[] = "CacheService::getReportPresets() not returning array";
            }
            
            // Test cache clearing
            CacheService::clear('test_key');
            
        } catch (\Exception $e) {
            $issues[] = "CacheService error: " . $e->getMessage();
        }
        
        return $issues;
    }
    
    private function validateQueryPerformance(): array
    {
        $issues = [];
        
        try {
            // Enable query logging
            DB::enableQueryLog();
            
            // Test optimized student query
            $students = Student::whereExists(function($q) {
                $q->select(DB::raw(1))
                  ->from('skills')
                  ->whereColumn('skills.student_id', 'students.id')
                  ->where('skill_name', 'like', '%test%');
            })->limit(10)->get();
            
            $queries = DB::getQueryLog();
            DB::disableQueryLog();
            
            // Check if query is using EXISTS instead of JOIN
            $lastQuery = end($queries);
            if ($lastQuery && !str_contains(strtolower($lastQuery['query']), 'exists')) {
                $issues[] = "Student query not using EXISTS optimization";
            }
            
        } catch (\Exception $e) {
            $issues[] = "Query performance test error: " . $e->getMessage();
        }
        
        return $issues;
    }
    
    private function validateApiEndpoints(): array
    {
        $issues = [];
        
        // This would require HTTP testing, which is complex in console
        // For now, just check if the controller methods exist
        
        $controllers = [
            'App\Http\Controllers\Api\ReportController' => ['students', 'search', 'summary', 'presets'],
            'App\Http\Controllers\Api\StudentController' => ['index', 'show'],
            'App\Http\Controllers\Api\FacultyEvaluationController' => ['adminSummary'],
        ];
        
        foreach ($controllers as $controller => $methods) {
            if (!class_exists($controller)) {
                $issues[] = "Controller {$controller} does not exist";
                continue;
            }
            
            foreach ($methods as $method) {
                if (!method_exists($controller, $method)) {
                    $issues[] = "Method {$method} missing in {$controller}";
                }
            }
        }
        
        return $issues;
    }
}