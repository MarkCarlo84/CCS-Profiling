<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use App\Models\Violation;
use App\Models\Affiliation;
use App\Models\Skill;
use App\Models\AcademicRecord;
use App\Services\BrevoMailService;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            // Selective eager loading based on request parameters
            $with = [];
            
            // Only load relationships when needed
            if ($request->boolean('with_details')) {
                $with = ['violations', 'affiliations', 'academicRecords.grades', 'skills', 'nonAcademicHistories'];
            } elseif ($request->boolean('with_basic_relations')) {
                $with = ['violations', 'affiliations'];
            }

            $query = Student::query();

            // Apply filters
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
                $query->where(function ($q) use ($s) {
                    $q->where('first_name', 'like', "%$s%")
                      ->orWhere('last_name', 'like', "%$s%")
                      ->orWhere('student_id', 'like', "%$s%");
                });
            }

            // Apply eager loading after filtering
            if (!empty($with)) {
                $query->with($with);
            }

            // Limit with_details queries to prevent memory exhaustion on large datasets
            if ($request->boolean('with_details') && !$request->filled('search') && !$request->filled('department')) {
                $students = $query->orderBy('last_name')->limit(500)->get();
            } else {
                $students = $query->orderBy('last_name')->get();
            }
            return response()->json($students);
        } catch (\Exception $e) {
            // Return empty array on error
            return response()->json([]);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id'               => 'nullable|digits_between:7,10',
            'department'               => 'nullable|in:IT,CS',
            'section'                  => 'nullable|in:A,B,C,D',
            'first_name'               => 'required|string|max:100',
            'middle_name'              => 'nullable|string|max:100',
            'last_name'                => 'required|string|max:100',
            'age'                      => 'nullable|integer|min:0|max:150',
            'guardian_name'            => 'nullable|string|max:100',
            'emergency_contact_name'   => 'nullable|string|max:100',
            'emergency_contact_number' => ['nullable', 'regex:/^09\d{9}$/'],
            'date_of_birth'            => 'nullable|date',
            'gender'                   => 'nullable|in:Male,Female,Other',
            'address'                  => 'nullable|string',
            'contact_number'           => ['nullable', 'regex:/^09\d{9}$/'],
            'email'                    => 'required|email|unique:users,email',
            'enrollment_date'          => 'nullable|date',
            'status'                   => 'in:active,inactive,graduated,dropped,loa',
            'year_level'               => 'nullable|integer|min:1|max:4',
        ]);

        // Auto-assign section if not provided and dept+year_level given
        if (empty($data['section']) && !empty($data['department']) && !empty($data['year_level'])) {
            $data['section'] = $this->autoAssignSection($data['department'], $data['year_level']);
        }

        // Remove year_level from student data (not a student column)
        unset($data['year_level']);

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

        try {
            $html = view('emails.welcome', [
                'name'      => $user->name,
                'email'     => $student->email,
                'password'  => $defaultPassword,
                'role'      => 'student',
                'id_number' => $student->student_id,
            ])->render();
            app(BrevoMailService::class)->send($student->email, $user->name, 'Welcome! Your Account Has Been Created', $html);
        } catch (\Exception $e) {
            \Log::error('Student welcome email failed: ' . $e->getMessage());
        }

        CacheService::invalidateOnDataChange('Student');
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
        // Load relationships selectively based on what's typically needed
        return response()->json($student->load([
            'violations:id,student_id,violation_type,severity_level,date_reported',
            'affiliations:id,student_id,name,type,position',
            'academicRecords' => function($query) {
                $query->select('id', 'student_id', 'school_year', 'semester', 'year_level', 'gpa')
                      ->with(['grades:id,academic_record_id,subject_id,subject_name,score,remarks']);
            },
            'skills:id,student_id,skill_name,skill_level,certification',
            'nonAcademicHistories:id,student_id,activity_name,category,date_participated'
        ]));
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'student_id'     => 'nullable|digits_between:7,10',
            'department'     => 'nullable|in:IT,CS',
            'section'        => 'nullable|in:A,B,C,D',
            'first_name'     => 'sometimes|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'last_name'      => 'sometimes|string|max:100',
            'age'            => 'nullable|integer|min:0|max:150',
            'guardian_name'  => 'nullable|string|max:100',
            'emergency_contact_name'   => 'nullable|string|max:100',
            'emergency_contact_number' => ['nullable', 'regex:/^09\d{9}$/'],
            'date_of_birth'  => 'nullable|date',
            'gender'         => 'nullable|in:Male,Female,Other',
            'address'        => 'nullable|string',
            'contact_number' => ['nullable', 'regex:/^09\d{9}$/'],
            'email'          => 'nullable|email',
            'enrollment_date'=> 'nullable|date',
            'status'         => 'in:active,inactive,graduated,dropped,loa',
        ]);
        $student->update($data);
        CacheService::invalidateOnDataChange('Student');
        return response()->json($student->load(['violations', 'affiliations', 'academicRecords', 'skills', 'nonAcademicHistories']));
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->delete();
        CacheService::invalidateOnDataChange('Student');
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

    /**
     * GET /api/students/section-capacity?department=IT&year_level=1
     * Returns count per section and auto-suggested section.
     */
    public function sectionCapacity(Request $request): JsonResponse
    {
        $dept      = $request->input('department');
        $yearLevel = (int) $request->input('year_level');

        if (!$dept || !$yearLevel) {
            return response()->json(['sections' => [], 'suggested' => null]);
        }

        // Count active students per section for this dept+year
        $counts = Student::where('department', $dept)
            ->whereHas('academicRecords', fn($q) => $q->where('year_level', $yearLevel))
            ->whereNotNull('section')
            ->selectRaw('section, COUNT(*) as count')
            ->groupBy('section')
            ->pluck('count', 'section')
            ->toArray();

        $sections = [];
        $suggested = null;
        foreach (['A', 'B', 'C', 'D'] as $s) {
            $count = $counts[$s] ?? 0;
            $full  = $count >= 30;
            $sections[$s] = ['count' => $count, 'full' => $full];
            if (!$suggested && !$full) $suggested = $s;
        }

        return response()->json(['sections' => $sections, 'suggested' => $suggested]);
    }

    /** Auto-assign the section with fewest students (max 30) */
    private function autoAssignSection(string $dept, int $yearLevel): ?string
    {
        $counts = Student::where('department', $dept)
            ->whereHas('academicRecords', fn($q) => $q->where('year_level', $yearLevel))
            ->whereNotNull('section')
            ->selectRaw('section, COUNT(*) as count')
            ->groupBy('section')
            ->pluck('count', 'section')
            ->toArray();

        foreach (['A', 'B', 'C', 'D'] as $s) {
            if (($counts[$s] ?? 0) < 30) return $s;
        }
        return null; // all full
    }
}
