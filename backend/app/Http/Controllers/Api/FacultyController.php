<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\Student;
use App\Models\EligibilityCriteria;
use App\Models\User;
use App\Services\BrevoMailService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class FacultyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Faculty::query();

        if ($request->filled('department')) {
            $query->where('department', 'like', "%{$request->department}%");
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name', 'like', "%$search%")
                  ->orWhere('faculty_id', 'like', "%$search%");
            });
        }

        return response()->json($query->orderBy('last_name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'faculty_id'     => 'nullable|string|max:50',
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'department'     => 'nullable|string|max:100',
            'position'       => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email',
            'contact_number' => ['nullable', 'regex:/^09\d{9}$/'],
        ]);

        $faculty = Faculty::create($data);

        // Auto-create user account with default password
        $defaultPassword = 'Faculty1234';
        $user = User::create([
            'name'               => $faculty->first_name . ' ' . $faculty->last_name,
            'email'              => $faculty->email,
            'password'           => Hash::make($defaultPassword),
            'role'               => 'teacher',
            'faculty_id'         => $faculty->id,
            'must_verify_email'  => true,
        ]);

        try {
            $html = view('emails.welcome', [
                'name'      => $user->name,
                'email'     => $faculty->email,
                'password'  => $defaultPassword,
                'role'      => 'faculty',
                'id_number' => $faculty->faculty_id,
            ])->render();
            app(BrevoMailService::class)->send($faculty->email, $user->name, 'Welcome! Your Account Has Been Created', $html);
        } catch (\Exception $e) {
            \Log::error('Faculty welcome email failed: ' . $e->getMessage());
        }

        return response()->json([
            'faculty' => $faculty,
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ], 201);
    }

    public function show(Faculty $faculty): JsonResponse
    {
        return response()->json($faculty);
    }

    public function update(Request $request, Faculty $faculty): JsonResponse
    {
        $data = $request->validate([
            'faculty_id'     => 'nullable|string|max:50',
            'first_name'     => 'sometimes|string|max:100',
            'last_name'      => 'sometimes|string|max:100',
            'department'     => 'nullable|string|max:100',
            'position'       => 'sometimes|string|max:100',
            'email'          => 'nullable|email',
            'contact_number' => ['nullable', 'regex:/^09\d{9}$/'],
        ]);
        $faculty->update($data);
        return response()->json($faculty);
    }

    public function destroy(Faculty $faculty): JsonResponse
    {
        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted.']);
    }

    /**
     * + createReport(criteria: EligibilityCriteria) : Report
     * POST /api/faculties/{faculty}/create-report/{criteria}
     */
    public function createReport(Faculty $faculty, EligibilityCriteria $eligibilityCriterion): JsonResponse
    {
        return response()->json($faculty->createReport($eligibilityCriterion));
    }

    /**
     * + evaluateStudent(student: Student) : void
     * GET /api/faculties/{faculty}/evaluate-student/{student}
     */
    public function evaluateStudent(Faculty $faculty, Student $student): JsonResponse
    {
        return response()->json([
            'faculty' => $faculty->full_name,
            'student' => $student->full_name,
            'results' => $faculty->evaluateStudent($student),
        ]);
    }

    /**
     * + recordViolation(student: Student, violation: Violation) : void
     * POST /api/faculties/{faculty}/record-violation/{student}
     */
    public function recordViolation(Request $request, Faculty $faculty, Student $student): JsonResponse
    {
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
     * PATCH /api/faculties/{faculty}/update-student/{student}
     */
    public function updateStudentRecord(Request $request, Faculty $faculty, Student $student): JsonResponse
    {
        $data = $request->validate([
            'first_name'     => 'sometimes|string|max:100',
            'last_name'      => 'sometimes|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'age'            => 'nullable|integer',
            'guardian_name'  => 'nullable|string|max:100',
            'date_of_birth'  => 'nullable|date',
            'gender'         => 'nullable|in:Male,Female,Other',
            'address'        => 'nullable|string',
            'contact_number' => 'nullable|string|max:30',
            'email'          => 'nullable|email',
            'enrollment_date'=> 'nullable|date',
            'status'         => 'nullable|in:active,inactive,graduated,dropped',
        ]);
        $updated = $faculty->updateStudentRecord($student, $data);
        return response()->json($updated);
    }
}
