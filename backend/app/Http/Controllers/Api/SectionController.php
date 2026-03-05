<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Section::with(['course.department']);

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->filled('year_level')) {
            $query->where('year_level', $request->year_level);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('school_year')) {
            $query->where('school_year', $request->school_year);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('name', 'like', "%$s%");
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'course_id'      => 'required|exists:courses,id',
            'name'           => 'required|string|max:50',
            'year_level'     => 'required|integer|min:1|max:5',
            'semester'       => 'required|in:1st,2nd,summer',
            'school_year'    => 'required|string|max:20',
            'max_students'   => 'integer|min:1|max:200',
            'enrolled_count' => 'integer|min:0',
        ]);

        $section = Section::create($data);
        return response()->json($section->load('course.department'), 201);
    }

    public function show(Section $section): JsonResponse
    {
        return response()->json($section->load(['course.department', 'schedules.faculty', 'schedules.room']));
    }

    public function update(Request $request, Section $section): JsonResponse
    {
        $data = $request->validate([
            'course_id'      => 'sometimes|exists:courses,id',
            'name'           => 'sometimes|string|max:50',
            'year_level'     => 'sometimes|integer|min:1|max:5',
            'semester'       => 'sometimes|in:1st,2nd,summer',
            'school_year'    => 'sometimes|string|max:20',
            'max_students'   => 'integer|min:1|max:200',
            'enrolled_count' => 'integer|min:0',
        ]);

        $section->update($data);
        return response()->json($section->load('course.department'));
    }

    public function destroy(Section $section): JsonResponse
    {
        $section->delete();
        return response()->json(['message' => 'Section deleted.']);
    }
}
