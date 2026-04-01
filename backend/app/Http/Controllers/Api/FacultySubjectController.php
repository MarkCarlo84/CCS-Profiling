<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\Subject;
use App\Models\AcademicPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacultySubjectController extends Controller
{
    /**
     * GET /api/admin/faculty-subjects
     * List all assignments, optionally filtered by school_year/semester.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Faculty::with(['subjects' => function ($q) use ($request) {
            if ($request->filled('school_year')) $q->wherePivot('school_year', $request->school_year);
            if ($request->filled('semester'))    $q->wherePivot('semester', $request->semester);
        }]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('first_name', 'like', "%$s%")
                ->orWhere('last_name', 'like', "%$s%")
                ->orWhere('faculty_id', 'like', "%$s%"));
        }

        return response()->json($query->orderBy('last_name')->get());
    }

    /**
     * POST /api/admin/faculty-subjects
     * Assign a subject to a faculty for a given period.
     * Body: { faculty_id, subject_id, school_year, semester }
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'faculty_id'  => 'required|exists:faculties,id',
            'subject_id'  => 'required|exists:subjects,id',
            'school_year' => 'required|string|max:20',
            'semester'    => 'required|in:1st,2nd',
        ]);

        $faculty = Faculty::findOrFail($data['faculty_id']);

        // Prevent duplicate
        $exists = $faculty->subjects()
            ->wherePivot('subject_id', $data['subject_id'])
            ->wherePivot('school_year', $data['school_year'])
            ->wherePivot('semester', $data['semester'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'This subject is already assigned to this faculty for the selected period.'], 422);
        }

        $faculty->subjects()->attach($data['subject_id'], [
            'school_year' => $data['school_year'],
            'semester'    => $data['semester'],
        ]);

        $subject = Subject::find($data['subject_id']);
        return response()->json([
            'message' => 'Subject assigned successfully.',
            'faculty' => $faculty->first_name . ' ' . $faculty->last_name,
            'subject' => $subject->subject_name,
        ], 201);
    }

    /**
     * DELETE /api/admin/faculty-subjects/{faculty}/{subject}
     * Remove a subject assignment from a faculty.
     */
    public function destroy(Request $request, Faculty $faculty, Subject $subject): JsonResponse
    {
        $faculty->subjects()->wherePivot('school_year', $request->school_year)
            ->wherePivot('semester', $request->semester)
            ->detach($subject->id);

        return response()->json(['message' => 'Assignment removed.']);
    }

    /**
     * GET /api/admin/faculty-subjects/{faculty}
     * Get all subjects assigned to a specific faculty.
     */
    public function facultySubjects(Request $request, Faculty $faculty): JsonResponse
    {
        $subjects = $faculty->subjects()
            ->when($request->filled('school_year'), fn($q) => $q->wherePivot('school_year', $request->school_year))
            ->when($request->filled('semester'),    fn($q) => $q->wherePivot('semester', $request->semester))
            ->get();

        return response()->json($subjects);
    }
}
