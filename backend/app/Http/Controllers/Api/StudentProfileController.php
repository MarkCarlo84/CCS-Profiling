<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Student POV — actions a logged-in student can perform on their own profile.
 * All routes require auth:sanctum + role:student middleware.
 */
class StudentProfileController extends Controller
{
    private function getStudent(Request $request): ?\App\Models\Student
    {
        return $request->user()->student;
    }

    /** GET /api/student/profile */
    public function profile(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);

        if (!$student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        return response()->json(
            $student->load(['violations', 'affiliations', 'academicRecords.grades.subject', 'skills', 'nonAcademicHistories'])
        );
    }

    /**
     * + updateProfile() : void
     * PATCH /api/student/profile
     * Students can only update their own contact info.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);

        if (!$student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        $data = $request->validate([
            'guardian_name'  => 'nullable|string|max:100',
            'address'        => 'nullable|string',
            'contact_number' => 'nullable|string|max:30',
            'email'          => 'nullable|email',
        ]);

        $student->updateProfile($data);
        return response()->json($student->fresh());
    }

    /**
     * + addSkill(skill: Skill) : void
     * POST /api/student/skills
     */
    public function addSkill(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);

        if (!$student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        $data = $request->validate([
            'skill_name'    => 'required|string|max:100',
            'skill_level'   => 'in:beginner,intermediate,advanced,expert',
            'certification' => 'boolean',
        ]);
        $data['certification'] = $data['certification'] ?? false;

        return response()->json($student->addSkill($data), 201);
    }

    /**
     * + addAffiliation(affiliation: Affiliation) : void
     * POST /api/student/affiliations
     */
    public function addAffiliation(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);

        if (!$student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        $data = $request->validate([
            'name'        => 'required|string|max:200',
            'type'        => 'nullable|string|max:100',
            'role'        => 'nullable|string|max:100',
            'date_joined' => 'nullable|date',
        ]);

        return response()->json($student->addAffiliation($data), 201);
    }

    /** GET /api/student/academic-records */
    public function academicRecords(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);

        if (!$student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        return response()->json($student->academicRecords()->with('grades.subject')->get());
    }

    /** GET /api/student/violations */
    public function violations(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);

        if (!$student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        return response()->json($student->violations);
    }

    /** GET /api/student/non-academic-histories */
    public function nonAcademicHistories(Request $request): JsonResponse
    {
        $student = $this->getStudent($request);

        if (!$student) {
            return response()->json(['message' => 'No student profile linked to this account.'], 404);
        }

        return response()->json($student->nonAcademicHistories);
    }
}
