<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Services\CacheService;

class ReportController extends Controller
{
    /**
     * Advanced student query for report generation.
     * Optimized with pagination, selective eager loading, and efficient filtering.
     */
    public function students(Request $request): JsonResponse
    {
        // Determine what relationships to load based on request
        $with = [];
        $needsSkills = $request->filled(['skill', 'skill_level', 'certification']);
        $needsAffiliations = $request->filled(['affiliation', 'affiliation_type']);
        $needsViolations = $request->filled(['has_violation', 'violation_severity']);
        $needsActivities = $request->filled('activity_category');
        $needsAcademics = $request->boolean('include_academics', false);

        if ($needsSkills || $request->boolean('include_skills', true)) {
            $with[] = 'skills';
        }
        if ($needsAffiliations || $request->boolean('include_affiliations', true)) {
            $with[] = 'affiliations';
        }
        if ($needsViolations || $request->boolean('include_violations', true)) {
            $with[] = 'violations';
        }
        if ($needsActivities || $request->boolean('include_activities', false)) {
            $with[] = 'nonAcademicHistories';
        }
        if ($needsAcademics) {
            $with[] = 'academicRecords.grades';
        }

        $query = Student::query();

        // Apply direct filters first (most efficient)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('student_id', 'like', "%$s%");
            });
        }

        // Apply relationship filters using exists subqueries (more efficient than whereHas)
        if ($request->filled('skill')) {
            $skill = $request->skill;
            $query->whereExists(function($q) use ($skill) {
                $q->select(DB::raw(1))
                  ->from('skills')
                  ->whereColumn('skills.student_id', 'students.id')
                  ->where('skill_name', 'like', "%$skill%");
            });
        }
        if ($request->filled('skill_level')) {
            $lvl = $request->skill_level;
            $query->whereExists(function($q) use ($lvl) {
                $q->select(DB::raw(1))
                  ->from('skills')
                  ->whereColumn('skills.student_id', 'students.id')
                  ->where('skill_level', $lvl);
            });
        }
        if ($request->filled('certification')) {
            $query->whereExists(function($q) {
                $q->select(DB::raw(1))
                  ->from('skills')
                  ->whereColumn('skills.student_id', 'students.id')
                  ->where('certification', true);
            });
        }
        if ($request->filled('affiliation')) {
            $org = $request->affiliation;
            $query->whereExists(function($q) use ($org) {
                $q->select(DB::raw(1))
                  ->from('affiliations')
                  ->whereColumn('affiliations.student_id', 'students.id')
                  ->where('name', 'like', "%$org%");
            });
        }
        if ($request->filled('affiliation_type')) {
            $type = $request->affiliation_type;
            $query->whereExists(function($q) use ($type) {
                $q->select(DB::raw(1))
                  ->from('affiliations')
                  ->whereColumn('affiliations.student_id', 'students.id')
                  ->where('type', $type);
            });
        }
        if ($request->filled('has_violation')) {
            $hasViolation = $request->has_violation === 'true' || $request->has_violation === '1';
            if ($hasViolation) {
                $query->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('violations')
                      ->whereColumn('violations.student_id', 'students.id');
                });
            } else {
                $query->whereNotExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('violations')
                      ->whereColumn('violations.student_id', 'students.id');
                });
            }
        }
        if ($request->filled('violation_severity')) {
            $sev = $request->violation_severity;
            $query->whereExists(function($q) use ($sev) {
                $q->select(DB::raw(1))
                  ->from('violations')
                  ->whereColumn('violations.student_id', 'students.id')
                  ->where('severity_level', $sev);
            });
        }
        if ($request->filled('activity_category')) {
            $cat = $request->activity_category;
            $query->whereExists(function($q) use ($cat) {
                $q->select(DB::raw(1))
                  ->from('non_academic_histories')
                  ->whereColumn('non_academic_histories.student_id', 'students.id')
                  ->where('category', 'like', "%$cat%");
            });
        }

        // Apply eager loading only after filtering
        if (!empty($with)) {
            $query->with($with);
        }

        // Implement pagination with reasonable defaults
        $perPage = min((int) $request->input('per_page', 50), 200);
        $students = $query->orderBy('last_name')->paginate($perPage);

        // Maintain backward compatibility with existing frontend
        if ($request->boolean('paginated', false)) {
            return response()->json($students);
        } else {
            // Return in original format for existing frontend code
            return response()->json([
                'count' => $students->total(),
                'students' => $students->items(),
                'pagination' => [
                    'current_page' => $students->currentPage(),
                    'last_page' => $students->lastPage(),
                    'per_page' => $students->perPage(),
                    'total' => $students->total(),
                ]
            ]);
        }
    }

    /**
     * Advanced faculty query for report generation.
     */
    public function faculties(Request $request): JsonResponse
    {
        $query = Faculty::query();

        if ($request->filled('department'))  $query->where('department', $request->department);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('first_name', 'like', "%$s%")
                ->orWhere('last_name', 'like', "%$s%")
                ->orWhere('faculty_id', 'like', "%$s%")
                ->orWhere('position', 'like', "%$s%"));
        }

        $faculties = $query->orderBy('last_name')->get();
        return response()->json(['count' => $faculties->count(), 'faculties' => $faculties]);
    }

    /**
     * Dashboard summary stats (diagram-aligned) - now cached.
     */
    public function summary(): JsonResponse
    {
        return response()->json(\App\Services\CacheService::getDashboardSummary());
    }

    /**
     * GET /api/reports/presets
     * Returns distinct skills and activity categories for dynamic preset buttons - now cached.
     */
    public function presets(): JsonResponse
    {
        return response()->json(\App\Services\CacheService::getReportPresets());
    }
    /**
     * Optimized search with selective loading and proper limits.
     */
    public function search(Request $request): JsonResponse
    {
        $q = $request->get('q', '');

        if (strlen(trim($q)) < 2) {
            return response()->json([
                'query' => $q, 
                'total' => 0, 
                'students' => [], 
                'faculties' => [], 
                'courses' => [], 
                'events' => []
            ]);
        }

        // Use minimal eager loading for search results
        $students = Student::select(['id', 'student_id', 'first_name', 'last_name', 'email', 'department', 'status'])
            ->where(function($query) use ($q) {
                $query->where('first_name', 'like', "%$q%")
                      ->orWhere('last_name', 'like', "%$q%")
                      ->orWhere('student_id', 'like', "%$q%")
                      ->orWhere('email', 'like', "%$q%");
            })
            ->limit(20)->get();

        $faculties = Faculty::select(['id', 'faculty_id', 'first_name', 'last_name', 'department', 'position'])
            ->where(function($query) use ($q) {
                $query->where('first_name', 'like', "%$q%")
                      ->orWhere('last_name', 'like', "%$q%")
                      ->orWhere('faculty_id', 'like', "%$q%")
                      ->orWhere('department', 'like', "%$q%");
            })
            ->limit(20)->get();

        $courses = \App\Models\Course::select(['id', 'name', 'code', 'department_id'])
            ->with(['department:id,name'])
            ->where(function($query) use ($q) {
                $query->where('name', 'like', "%$q%")
                      ->orWhere('code', 'like', "%$q%");
            })
            ->limit(20)->get();

        $events = \App\Models\Event::select(['id', 'title', 'venue', 'event_date', 'max_participants'])
            ->where(function($query) use ($q) {
                $query->where('title', 'like', "%$q%")
                      ->orWhere('venue', 'like', "%$q%");
            })
            ->limit(20)->get();

        return response()->json([
            'query'     => $q,
            'total'     => $students->count() + $faculties->count() + $courses->count() + $events->count(),
            'students'  => $students,
            'faculties' => $faculties,
            'courses'   => $courses,
            'events'    => $events,
        ]);
    }
}
