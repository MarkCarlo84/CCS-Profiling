<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Course;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Advanced student query for report generation.
     */
    public function students(Request $request): JsonResponse
    {
        $query = Student::with(['department', 'affiliations', 'violations', 'academicRecords', 'nonAcademicRecords', 'skills']);

        if ($request->filled('department_id'))   $query->where('department_id', $request->department_id);
        if ($request->filled('year_level'))       $query->where('year_level', $request->year_level);
        if ($request->filled('gender'))           $query->where('gender', $request->gender);
        if ($request->filled('status'))           $query->where('status', $request->status);
        if ($request->filled('min_gpa'))          $query->where('gpa', '>=', $request->min_gpa);
        if ($request->filled('max_gpa'))          $query->where('gpa', '<=', $request->max_gpa);

        if ($request->filled('skill')) {
            $skill = $request->skill;
            $query->whereHas('skills', fn($q) => $q->where('skill', 'like', "%$skill%"));
        }
        if ($request->filled('skill_category')) {
            $cat = $request->skill_category;
            $query->whereHas('skills', fn($q) => $q->where('category', 'like', "%$cat%"));
        }
        if ($request->filled('affiliation')) {
            $org = $request->affiliation;
            $query->whereHas('affiliations', fn($q) => $q->where('organization', 'like', "%$org%"));
        }
        if ($request->filled('has_violation')) {
            $request->has_violation === 'true' || $request->has_violation === '1'
                ? $query->whereHas('violations')
                : $query->whereDoesntHave('violations');
        }
        if ($request->filled('violation_severity')) {
            $sev = $request->violation_severity;
            $query->whereHas('violations', fn($q) => $q->where('severity', $sev));
        }
        if ($request->filled('activity_category')) {
            $cat = $request->activity_category;
            $query->whereHas('nonAcademicRecords', fn($q) => $q->where('category', 'like', "%$cat%"));
        }
        if ($request->filled('award_level')) {
            $lvl = $request->award_level;
            $query->whereHas('nonAcademicRecords', fn($q) => $q->where('level', $lvl));
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('first_name','like',"%$s%")->orWhere('last_name','like',"%$s%")->orWhere('student_number','like',"%$s%"));
        }

        $students = $query->orderBy('last_name')->get();
        return response()->json(['count' => $students->count(), 'students' => $students]);
    }

    /**
     * Advanced faculty query for report generation.
     */
    public function faculties(Request $request): JsonResponse
    {
        $query = Faculty::with('department');

        if ($request->filled('department_id'))  $query->where('department_id', $request->department_id);
        if ($request->filled('status'))         $query->where('status', $request->status);
        if ($request->filled('employment_type'))$query->where('employment_type', $request->employment_type);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('first_name','like',"%$s%")->orWhere('last_name','like',"%$s%")->orWhere('employee_number','like',"%$s%")->orWhere('position','like',"%$s%"));
        }

        $faculties = $query->orderBy('last_name')->get();
        return response()->json(['count' => $faculties->count(), 'faculties' => $faculties]);
    }

    /**
     * Dashboard summary stats.
     */
    public function summary(): JsonResponse
    {
        return response()->json([
            'departments'    => Department::count(),
            'total_faculty'  => Faculty::count(),
            'total_students' => Student::count(),
            'active_students'=> Student::where('status', 'active')->count(),
            'total_courses'  => Course::count(),
            'total_events'   => Event::count(),
            'upcoming_events'=> Event::where('status', 'upcoming')->count(),
            'by_year_level'  => Student::selectRaw('year_level, count(*) as count')
                                    ->groupBy('year_level')->pluck('count', 'year_level'),
            'by_department'  => Department::withCount('students')->get()->map(fn($d) => [
                'name'  => $d->name,
                'code'  => $d->code,
                'count' => $d->students_count,
            ]),
        ]);
    }

    /**
     * Cross-module comprehensive search across Students, Faculty, Courses, and Events.
     */
    public function search(Request $request): JsonResponse
    {
        $q = $request->get('q', '');

        if (strlen(trim($q)) < 2) {
            return response()->json(['query'=>$q,'total'=>0,'students'=>[],'faculties'=>[],'courses'=>[],'events'=>[]]);
        }

        $students = Student::with('department')
            ->where(fn($query) => $query->where('first_name','like',"%$q%")->orWhere('last_name','like',"%$q%")->orWhere('student_number','like',"%$q%")->orWhere('email','like',"%$q%"))
            ->limit(20)->get();

        $faculties = Faculty::with('department')
            ->where(fn($query) => $query->where('first_name','like',"%$q%")->orWhere('last_name','like',"%$q%")->orWhere('employee_number','like',"%$q%")->orWhere('specialization','like',"%$q%"))
            ->limit(20)->get();

        $courses = Course::with('department')
            ->where(fn($query) => $query->where('name','like',"%$q%")->orWhere('code','like',"%$q%")->orWhere('description','like',"%$q%"))
            ->limit(20)->get();

        $events = Event::with('department')
            ->where(fn($query) => $query->where('title','like',"%$q%")->orWhere('category','like',"%$q%")->orWhere('organizer','like',"%$q%")->orWhere('venue','like',"%$q%"))
            ->limit(20)->get();

        return response()->json([
            'query'    => $q,
            'total'    => $students->count() + $faculties->count() + $courses->count() + $events->count(),
            'students' => $students,
            'faculties'=> $faculties,
            'courses'  => $courses,
            'events'   => $events,
        ]);
    }
}
