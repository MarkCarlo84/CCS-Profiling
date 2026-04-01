<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EligibilityCriteria;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Teacher POV — actions a logged-in teacher can perform on their own faculty profile.
 * All routes require auth:sanctum + role:teacher middleware.
 */
class TeacherController extends Controller
{
    /** GET /api/teacher/profile */
    public function profile(Request $request): JsonResponse
    {
        $faculty = $request->user()->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'No faculty profile linked to this account.'], 404);
        }

        return response()->json($faculty);
    }

    /** PATCH /api/teacher/profile */
    public function updateProfile(Request $request): JsonResponse
    {
        $faculty = $request->user()->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'No faculty profile linked to this account.'], 404);
        }

        $data = $request->validate([
            'first_name'     => 'sometimes|string|max:100',
            'last_name'      => 'sometimes|string|max:100',
            'department'     => 'nullable|string|max:100',
            'position'       => 'sometimes|string|max:100',
            'email'          => 'nullable|email',
            'contact_number' => 'nullable|string|max:30',
        ]);

        $faculty->update($data);
        return response()->json($faculty->fresh());
    }

    /**
     * + createReport(criteria: EligibilityCriteria) : Report
     * POST /api/teacher/create-report/{eligibilityCriterion}
     */
    public function createReport(Request $request, EligibilityCriteria $eligibilityCriterion): JsonResponse
    {
        $faculty = $request->user()->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'No faculty profile linked to this account.'], 404);
        }

        return response()->json($faculty->createReport($eligibilityCriterion));
    }

    /**
     * + evaluateStudent(student: Student) : void
     * GET /api/teacher/evaluate-student/{student}
     */
    public function evaluateStudent(Request $request, Student $student): JsonResponse
    {
        $faculty = $request->user()->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'No faculty profile linked to this account.'], 404);
        }

        return response()->json([
            'faculty' => $faculty->full_name,
            'student' => $student->full_name,
            'results' => $faculty->evaluateStudent($student),
        ]);
    }

    /**
     * + recordViolation(student: Student, violation: Violation) : void
     * POST /api/teacher/record-violation/{student}
     */
    public function recordViolation(Request $request, Student $student): JsonResponse
    {
        $faculty = $request->user()->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'No faculty profile linked to this account.'], 404);
        }

        $data = $request->validate([
            'violation_type' => 'required|string|max:100',
            'description'    => 'nullable|string',
            'date_committed' => 'nullable|date',
            'severity_level' => 'in:minor,major,grave',
            'action_taken'   => 'nullable|string',
        ]);

        $violation = $faculty->recordViolation($student, $data);
        return response()->json($violation, 201);
    }

    /**
     * + updateStudentRecord(student: Student) : void
     * PATCH /api/teacher/update-student/{student}
     */
    public function updateStudentRecord(Request $request, Student $student): JsonResponse
    {
        $faculty = $request->user()->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'No faculty profile linked to this account.'], 404);
        }

        $data = $request->validate([
            'first_name'      => 'sometimes|string|max:100',
            'last_name'       => 'sometimes|string|max:100',
            'middle_name'     => 'nullable|string|max:100',
            'age'             => 'nullable|integer',
            'guardian_name'   => 'nullable|string|max:100',
            'date_of_birth'   => 'nullable|date',
            'gender'          => 'nullable|in:Male,Female,Other',
            'address'         => 'nullable|string',
            'contact_number'  => 'nullable|string|max:30',
            'email'           => 'nullable|email',
            'enrollment_date' => 'nullable|date',
            'status'          => 'nullable|in:active,inactive,graduated,dropped',
        ]);

        $updated = $faculty->updateStudentRecord($student, $data);
        return response()->json($updated);
    }

    /** GET /api/teacher/my-subjects — subjects assigned to this teacher */
    public function mySubjects(Request $request): JsonResponse
    {
        $faculty = $request->user()->faculty;

        if (!$faculty) {
            return response()->json(['message' => 'No faculty profile linked to this account.'], 404);
        }

        $query = $faculty->subjects();

        if ($request->filled('school_year')) {
            $query->wherePivot('school_year', $request->school_year);
        }
        if ($request->filled('semester')) {
            $query->wherePivot('semester', $request->semester);
        }

        $subjects = $query->get()->map(fn($s) => array_merge($s->toArray(), [
            'pivot_school_year' => $s->pivot->school_year,
            'pivot_semester'    => $s->pivot->semester,
        ]));

        return response()->json($subjects);
    }

    /** GET /api/teacher/students — list all students (read-only view) */
    public function students(Request $request): JsonResponse
    {
        $query = Student::with(['violations', 'affiliations', 'academicRecords.grades', 'skills', 'nonAcademicHistories']);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('student_id', 'like', "%$s%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('last_name')->get());
    }
}
