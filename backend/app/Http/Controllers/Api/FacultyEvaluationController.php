<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\FacultyEvaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacultyEvaluationController extends Controller
{
    private function getStudent(Request $request)
    {
        return $request->user()->student;
    }

    /**
     * GET /api/student/evaluations
     * List all evaluations submitted by this student.
     */
    public function index(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);
        if (!$student) return response()->json(['message' => 'No student profile.'], 404);

        $evals = FacultyEvaluation::with('faculty:id,first_name,last_name,department,position')
            ->where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($e) => array_merge($e->toArray(), ['average_rating' => $e->average_rating]));

        return response()->json($evals);
    }

    /**
     * GET /api/student/evaluations/faculties
     * List all faculties available to evaluate.
     */
    public function faculties(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);
        $faculties = Faculty::orderBy('last_name')->get(['id', 'first_name', 'last_name', 'department', 'position']);

        // Mark which ones this student already evaluated this semester
        $evaluated = FacultyEvaluation::where('student_id', $student?->id)->pluck('faculty_id')->toArray();

        return response()->json($faculties->map(fn($f) => array_merge($f->toArray(), [
            'already_evaluated' => in_array($f->id, $evaluated),
        ])));
    }

    /**
     * POST /api/student/evaluations
     * Submit a new evaluation.
     */
    public function store(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);
        if (!$student) return response()->json(['message' => 'No student profile.'], 404);

        $data = $request->validate([
            'faculty_id'             => 'required|exists:faculties,id',
            'teaching_effectiveness' => 'required|integer|min:1|max:5',
            'communication'          => 'required|integer|min:1|max:5',
            'professionalism'        => 'required|integer|min:1|max:5',
            'subject_mastery'        => 'required|integer|min:1|max:5',
            'student_engagement'     => 'required|integer|min:1|max:5',
            'comments'               => 'nullable|string|max:1000',
            'school_year'            => 'nullable|string|max:20',
            'semester'               => 'nullable|string|max:30',
        ]);

        $data['student_id'] = $student->id;

        // Check for duplicate
        $exists = FacultyEvaluation::where('faculty_id', $data['faculty_id'])
            ->where('student_id', $student->id)
            ->when($data['school_year'] ?? null, fn($q, $v) => $q->where('school_year', $v))
            ->when($data['semester'] ?? null, fn($q, $v) => $q->where('semester', $v))
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already evaluated this faculty for this period.'], 422);
        }

        $eval = FacultyEvaluation::create($data);
        $eval->load('faculty:id,first_name,last_name,department,position');

        return response()->json(array_merge($eval->toArray(), ['average_rating' => $eval->average_rating]), 201);
    }

    /**
     * GET /api/teacher/my-evaluations
     * Teacher sees their own evaluations — fully anonymous (no student info).
     */
    public function teacherIndex(Request $request): JsonResponse
    {
        $facultyId = $request->user()->faculty_id;
        if (!$facultyId) {
            return response()->json(['message' => 'No faculty profile linked.'], 403);
        }

        $evals = FacultyEvaluation::where('faculty_id', $facultyId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($e) => [
                // Never expose student_id or any student info
                'id'                     => $e->id,
                'teaching_effectiveness' => $e->teaching_effectiveness,
                'communication'          => $e->communication,
                'professionalism'        => $e->professionalism,
                'subject_mastery'        => $e->subject_mastery,
                'student_engagement'     => $e->student_engagement,
                'average_rating'         => $e->average_rating,
                'comments'               => $e->comments,
                'school_year'            => $e->school_year,
                'semester'               => $e->semester,
                'created_at'             => $e->created_at,
            ]);

        return response()->json($evals);
    }
    public function adminIndex(Request $request): JsonResponse
    {
        $query = FacultyEvaluation::with([
            'faculty:id,first_name,last_name,department,position',
            'student:id,first_name,last_name,student_id',
        ])->orderBy('created_at', 'desc');

        if ($request->filled('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }

        $paginated = $query->paginate(15);

        return response()->json([
            'data'         => collect($paginated->items())->map(fn($e) => array_merge($e->toArray(), ['average_rating' => $e->average_rating])),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'per_page'     => $paginated->perPage(),
            'total'        => $paginated->total(),
        ]);
    }

    /**
     * GET /api/admin/faculty-evaluations/summary
     * Per-faculty average scores.
     */
    public function adminSummary(): JsonResponse
    {
        $faculties = Faculty::with('evaluations')->get(['id', 'first_name', 'last_name', 'department', 'position']);

        $summary = $faculties->map(function ($f) {
            $evals = $f->evaluations;
            if ($evals->isEmpty()) {
                return array_merge($f->toArray(), ['evaluation_count' => 0, 'average_rating' => null]);
            }
            $avg = fn($field) => round($evals->avg($field), 2);
            return array_merge($f->toArray(), [
                'evaluation_count'       => $evals->count(),
                'average_rating'         => round($evals->map(fn($e) => $e->average_rating)->avg(), 2),
                'teaching_effectiveness' => $avg('teaching_effectiveness'),
                'communication'          => $avg('communication'),
                'professionalism'        => $avg('professionalism'),
                'subject_mastery'        => $avg('subject_mastery'),
                'student_engagement'     => $avg('student_engagement'),
            ]);
        });

        return response()->json($summary);
    }
}
