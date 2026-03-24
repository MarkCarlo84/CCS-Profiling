<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\Student;
use App\Models\User;
use App\Models\Violation;
use App\Models\Affiliation;
use App\Models\Skill;
use App\Models\AcademicRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['violations', 'affiliations', 'academicRecords.grades', 'skills', 'nonAcademicHistories']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('student_id', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('last_name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id'     => 'nullable|string|max:50',
            'first_name'     => 'required|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'last_name'      => 'required|string|max:100',
            'age'            => 'nullable|integer|min:0|max:150',
            'guardian_name'  => 'nullable|string|max:100',
            'date_of_birth'  => 'nullable|date',
            'gender'         => 'nullable|in:Male,Female,Other',
            'address'        => 'nullable|string',
            'contact_number' => 'nullable|string|max:30',
            'email'          => 'required|email|unique:users,email',
            'enrollment_date'=> 'nullable|date',
            'status'         => 'in:active,inactive,graduated,dropped',
        ]);

        $student = Student::create($data);

        // Auto-create user account with default password
        $defaultPassword = 'Student1234';
        $user = User::create([
            'name'               => $student->first_name . ' ' . $student->last_name,
            'email'              => $student->email,
            'password'           => Hash::make($defaultPassword),
            'role'               => 'student',
            'student_id'         => $student->id,
            'must_verify_email'  => true,
        ]);

        // Send welcome email after response is returned
        $name = $user->name;
        $email = $student->email;
        register_shutdown_function(function () use ($name, $email, $defaultPassword) {
            try {
                Mail::to($email)->send(new WelcomeMail($name, $email, $defaultPassword, 'student'));
            } catch (\Exception $e) {
                \Log::error('Student welcome email failed: ' . $e->getMessage());
            }
        });

        return response()->json([
            'student' => $student->load(['violations', 'affiliations', 'academicRecords', 'skills', 'nonAcademicHistories']),
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ], 201);
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json($student->load(['violations', 'affiliations', 'academicRecords.grades.subject', 'skills', 'nonAcademicHistories']));
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'student_id'     => 'nullable|string|max:50',
            'first_name'     => 'sometimes|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'last_name'      => 'sometimes|string|max:100',
            'age'            => 'nullable|integer|min:0|max:150',
            'guardian_name'  => 'nullable|string|max:100',
            'date_of_birth'  => 'nullable|date',
            'gender'         => 'nullable|in:Male,Female,Other',
            'address'        => 'nullable|string',
            'contact_number' => 'nullable|string|max:30',
            'email'          => 'nullable|email',
            'enrollment_date'=> 'nullable|date',
            'status'         => 'in:active,inactive,graduated,dropped',
        ]);
        $student->update($data);
        return response()->json($student->load(['violations', 'affiliations', 'academicRecords', 'skills', 'nonAcademicHistories']));
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->delete();
        return response()->json(['message' => 'Student deleted.']);
    }

    /** + updateProfile() endpoint — PATCH /api/students/{student}/update-profile */
    public function updateProfile(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'guardian_name'  => 'nullable|string|max:100',
            'address'        => 'nullable|string',
            'contact_number' => 'nullable|string|max:30',
            'email'          => 'nullable|email',
        ]);
        $student->updateProfile($data);
        return response()->json($student->fresh());
    }

    /** + addViolation(violation: Violation) — POST /api/students/{student}/violations */
    public function addViolation(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'violation_type' => 'required|string|max:100',
            'description'    => 'nullable|string',
            'date_committed' => 'nullable|date',
            'severity_level' => 'in:minor,major,grave',
            'action_taken'   => 'nullable|string',
        ]);
        return response()->json($student->addViolation($data), 201);
    }

    /** + addAffiliation(affiliation: Affiliation) — POST /api/students/{student}/affiliations */
    public function addAffiliation(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:200',
            'type'        => 'nullable|string|max:100',
            'role'        => 'nullable|string|max:100',
            'date_joined' => 'nullable|date',
        ]);
        return response()->json($student->addAffiliation($data), 201);
    }

    /** + addSkill(skill: Skill) — POST /api/students/{student}/skills */
    public function addSkill(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'skill_name'    => 'required|string|max:100',
            'skill_level'   => 'in:beginner,intermediate,advanced,expert',
            'certification' => 'boolean',
        ]);
        $data['certification'] = $data['certification'] ?? false;
        return response()->json($student->addSkill($data), 201);
    }

    /** + addAcademicRecord(record: AcademicRecord) — POST /api/students/{student}/academic-records */
    public function addAcademicRecord(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'school_year' => 'required|string|max:20',
            'semester'    => 'nullable|string|max:30',
            'gpa'         => 'nullable|numeric|min:0|max:5',
        ]);
        return response()->json($student->addAcademicRecord($data), 201);
    }
}
