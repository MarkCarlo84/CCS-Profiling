<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials. Please try again.'],
            ]);
        }

        // Delete old tokens and create a new one
        $user->tokens()->delete();
        $token = $user->createToken('ccs-profiling-token')->plainTextToken;

        $profile = null;
        if ($user->isTeacher() && $user->faculty_id) {
            $profile = $user->faculty;
        } elseif ($user->isStudent() && $user->student_id) {
            $profile = $user->student;
        }

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'role'    => $user->role,
                'profile' => $profile,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $profile = null;
        if ($user->isTeacher() && $user->faculty_id) {
            $profile = $user->faculty;
        } elseif ($user->isStudent() && $user->student_id) {
            $profile = $user->student->load(['violations', 'affiliations', 'academicRecords.grades', 'skills', 'nonAcademicHistories']);
        }

        return response()->json([
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'role'    => $user->role,
            'profile' => $profile,
        ]);
    }

    // ── Admin: User Management ────────────────────────────────────────────────

    /** GET /api/admin/users */
    public function listUsers(): JsonResponse
    {
        return response()->json(User::select('id', 'name', 'email', 'role', 'faculty_id', 'student_id', 'created_at')->get());
    }

    /**
     * POST /api/admin/users
     * Create a new user account (admin, teacher, or student).
     */
    public function createUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:8',
            'role'       => 'required|in:admin,teacher,student',
            'faculty_id' => 'nullable|exists:faculties,id',
            'student_id' => 'nullable|exists:students,id',
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'faculty_id' => $user->faculty_id,
            'student_id' => $user->student_id,
        ], 201);
    }

    /**
     * PATCH /api/admin/users/{user}
     * Update a user's role or linked profile.
     */
    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'sometimes|string|max:100',
            'email'      => 'sometimes|email|unique:users,email,' . $user->id,
            'password'   => 'sometimes|string|min:8',
            'role'       => 'sometimes|in:admin,teacher,student',
            'faculty_id' => 'nullable|exists:faculties,id',
            'student_id' => 'nullable|exists:students,id',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'faculty_id' => $user->faculty_id,
            'student_id' => $user->student_id,
        ]);
    }

    /** DELETE /api/admin/users/{user} */
    public function deleteUser(User $user): JsonResponse
    {
        $user->tokens()->delete();
        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }
}
