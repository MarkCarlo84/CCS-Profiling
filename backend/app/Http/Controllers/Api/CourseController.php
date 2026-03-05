<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::with('department');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('code', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('code')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'department_id'  => 'required|exists:departments,id',
            'code'           => 'required|string|max:20|unique:courses',
            'name'           => 'required|string|max:200',
            'units'          => 'required|integer|min:1|max:9',
            'hours_per_week' => 'required|integer|min:1|max:20',
            'type'           => 'required|in:lecture,lab,both',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $course = Course::create($data);
        return response()->json($course->load('department'), 201);
    }

    public function show(Course $course): JsonResponse
    {
        return response()->json($course->load(['department', 'sections']));
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'department_id'  => 'sometimes|exists:departments,id',
            'code'           => "sometimes|string|max:20|unique:courses,code,{$course->id}",
            'name'           => 'sometimes|string|max:200',
            'units'          => 'sometimes|integer|min:1|max:9',
            'hours_per_week' => 'sometimes|integer|min:1|max:20',
            'type'           => 'sometimes|in:lecture,lab,both',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $course->update($data);
        return response()->json($course->load('department'));
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();
        return response()->json(['message' => 'Course deleted.']);
    }
}
