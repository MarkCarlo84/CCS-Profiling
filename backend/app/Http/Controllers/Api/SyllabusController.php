<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Syllabus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SyllabusController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Syllabus::with(['curriculum', 'course', 'faculty']);

        if ($request->filled('curriculum_id')) {
            $query->where('curriculum_id', $request->curriculum_id);
        }
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->filled('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('school_year')) {
            $query->where('school_year', $request->school_year);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('school_year', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'curriculum_id'      => 'required|exists:curricula,id',
            'course_id'          => 'required|exists:courses,id',
            'faculty_id'         => 'nullable|exists:faculties,id',
            'semester'           => 'required|in:1st,2nd,summer',
            'school_year'        => 'required|string|max:20',
            'course_description' => 'nullable|string',
            'objectives'         => 'nullable|string',
            'references'         => 'nullable|string',
            'status'             => 'in:draft,approved,archived',
        ]);

        $syllabus = Syllabus::create($data);
        return response()->json($syllabus->load(['curriculum', 'course', 'faculty']), 201);
    }

    public function show(Syllabus $syllabus): JsonResponse
    {
        return response()->json($syllabus->load(['curriculum', 'course', 'faculty', 'lessons']));
    }

    public function update(Request $request, Syllabus $syllabus): JsonResponse
    {
        $data = $request->validate([
            'curriculum_id'      => 'sometimes|exists:curricula,id',
            'course_id'          => 'sometimes|exists:courses,id',
            'faculty_id'         => 'nullable|exists:faculties,id',
            'semester'           => 'sometimes|in:1st,2nd,summer',
            'school_year'        => 'sometimes|string|max:20',
            'course_description' => 'nullable|string',
            'objectives'         => 'nullable|string',
            'references'         => 'nullable|string',
            'status'             => 'in:draft,approved,archived',
        ]);

        $syllabus->update($data);
        return response()->json($syllabus->load(['curriculum', 'course', 'faculty']));
    }

    public function destroy(Syllabus $syllabus): JsonResponse
    {
        $syllabus->delete();
        return response()->json(['message' => 'Syllabus deleted.']);
    }
}
