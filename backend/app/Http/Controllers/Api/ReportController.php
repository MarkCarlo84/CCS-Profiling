<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ReportController extends Controller
{
    /**
     * Advanced student query for report generation.
     */
    public function students(Request $request): JsonResponse
    {
        $query = Student::with(['affiliations', 'violations', 'academicRecords.grades', 'skills', 'nonAcademicHistories']);

        if ($request->filled('status'))          $query->where('status', $request->status);
        if ($request->filled('gender'))          $query->where('gender', $request->gender);
        if ($request->filled('department'))      $query->where('department', $request->department);

        if ($request->filled('skill')) {
            $skill = $request->skill;
            $query->whereHas('skills', fn($q) => $q->where('skill_name', 'like', "%$skill%"));
        }
        if ($request->filled('skill_level')) {
            $lvl = $request->skill_level;
            $query->whereHas('skills', fn($q) => $q->where('skill_level', $lvl));
        }
        if ($request->filled('certification')) {
            $query->whereHas('skills', fn($q) => $q->where('certification', true));
        }
        if ($request->filled('affiliation')) {
            $org = $request->affiliation;
            $query->whereHas('affiliations', fn($q) => $q->where('name', 'like', "%$org%"));
        }
        if ($request->filled('affiliation_type')) {
            $type = $request->affiliation_type;
            $query->whereHas('affiliations', fn($q) => $q->where('type', $type));
        }
        if ($request->filled('has_violation')) {
            $request->has_violation === 'true' || $request->has_violation === '1'
                ? $query->whereHas('violations')
                : $query->whereDoesntHave('violations');
        }
        if ($request->filled('violation_severity')) {
            $sev = $request->violation_severity;
            $query->whereHas('violations', fn($q) => $q->where('severity_level', $sev));
        }
        if ($request->filled('activity_category')) {
            $cat = $request->activity_category;
            $query->whereHas('nonAcademicHistories', fn($q) => $q->where('category', 'like', "%$cat%"));
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('first_name', 'like', "%$s%")
                ->orWhere('last_name', 'like', "%$s%")
                ->orWhere('student_id', 'like', "%$s%"));
        }

        $students = $query->orderBy('last_name')->get();
        return response()->json(['count' => $students->count(), 'students' => $students]);
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
     * Dashboard summary stats (diagram-aligned).
     */
    public function summary(): JsonResponse
    {
        $data = Cache::remember('report_summary', 300, function () {
            return [
                'total_faculty'   => Faculty::count(),
                'total_students'  => Student::count(),
                'active_students' => Student::where('status', 'active')->count(),
                'total_subjects'  => \App\Models\Subject::count(),
                'total_violations'=> \App\Models\Violation::count(),
                'by_gender'       => Student::selectRaw('gender, count(*) as count')
                                        ->groupBy('gender')->pluck('count', 'gender'),
            ];
        });

        return response()->json($data);
    }

    /**
     * GET /api/reports/presets
     * Returns distinct skills and activity categories for dynamic preset buttons.
     */
    public function presets(): JsonResponse
    {
        $data = Cache::remember('report_presets', 600, function () {
            $skills = \App\Models\Skill::select('skill_name')
                ->distinct()
                ->orderBy('skill_name')
                ->pluck('skill_name');

            $affiliations = \App\Models\Affiliation::select('name')
                ->whereNotNull('name')
                ->distinct()
                ->orderBy('name')
                ->pluck('name');

            return ['skills' => $skills, 'affiliations' => $affiliations];
        });

        return response()->json($data);
    }
    public function search(Request $request): JsonResponse
    {
        $q = $request->get('q', '');

        if (strlen(trim($q)) < 2) {
            return response()->json(['query' => $q, 'total' => 0, 'students' => [], 'faculties' => [], 'courses' => [], 'events' => []]);
        }

        $students = Student::with(['violations', 'skills', 'affiliations', 'nonAcademicHistories', 'academicRecords.grades.subject'])
            ->where(fn($query) => $query
                ->where('first_name', 'like', "%$q%")
                ->orWhere('last_name', 'like', "%$q%")
                ->orWhere('student_id', 'like', "%$q%")
                ->orWhere('email', 'like', "%$q%"))
            ->limit(20)->get();

        $faculties = Faculty::where(fn($query) => $query
            ->where('first_name', 'like', "%$q%")
            ->orWhere('last_name', 'like', "%$q%")
            ->orWhere('faculty_id', 'like', "%$q%")
            ->orWhere('department', 'like', "%$q%"))
            ->limit(20)->get();

        $courses = \App\Models\Course::with('department')
            ->where(fn($query) => $query
                ->where('name', 'like', "%$q%")
                ->orWhere('code', 'like', "%$q%"))
            ->limit(20)->get();

        $events = \App\Models\Event::where(fn($query) => $query
            ->where('title', 'like', "%$q%")
            ->orWhere('venue', 'like', "%$q%"))
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
