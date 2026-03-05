<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LessonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Lesson::with('syllabus');

        if ($request->filled('syllabus_id')) {
            $query->where('syllabus_id', $request->syllabus_id);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('topic', 'like', "%$s%")
                  ->orWhere('learning_objectives', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('week_number')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'syllabus_id'         => 'required|exists:syllabi,id',
            'week_number'         => 'required|integer|min:1|max:20',
            'topic'               => 'required|string|max:255',
            'learning_objectives' => 'nullable|string',
            'materials'           => 'nullable|string',
            'activities'          => 'nullable|string',
            'assessment'          => 'nullable|string',
        ]);

        $lesson = Lesson::create($data);
        return response()->json($lesson->load('syllabus'), 201);
    }

    public function show(Lesson $lesson): JsonResponse
    {
        return response()->json($lesson->load('syllabus'));
    }

    public function update(Request $request, Lesson $lesson): JsonResponse
    {
        $data = $request->validate([
            'syllabus_id'         => 'sometimes|exists:syllabi,id',
            'week_number'         => 'sometimes|integer|min:1|max:20',
            'topic'               => 'sometimes|string|max:255',
            'learning_objectives' => 'nullable|string',
            'materials'           => 'nullable|string',
            'activities'          => 'nullable|string',
            'assessment'          => 'nullable|string',
        ]);

        $lesson->update($data);
        return response()->json($lesson->load('syllabus'));
    }

    public function destroy(Lesson $lesson): JsonResponse
    {
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted.']);
    }
}
