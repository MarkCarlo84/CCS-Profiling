<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NonAcademicHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NonAcademicHistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NonAcademicHistory::with('student');
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->filled('category')) {
            $query->where('category', 'like', "%{$request->category}%");
        }
        return response()->json($query->orderBy('date_started', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id'     => 'required|exists:students,id',
            'activity_title' => 'required|string|max:200',
            'category'       => 'nullable|string|max:100',
            'description'    => 'nullable|string',
            'date_started'   => 'nullable|date',
            'date_ended'     => 'nullable|date|after_or_equal:date_started',
            'role'           => 'nullable|string|max:100',
            'organizer'      => 'nullable|string|max:150',
            'game_result'    => 'nullable|string|max:150',
        ]);
        return response()->json(NonAcademicHistory::create($data)->load('student'), 201);
    }

    public function show(NonAcademicHistory $nonAcademicHistory): JsonResponse
    {
        return response()->json($nonAcademicHistory->load('student'));
    }

    /** + getActivityDetails() endpoint */
    public function activityDetails(NonAcademicHistory $nonAcademicHistory): JsonResponse
    {
        return response()->json(['details' => $nonAcademicHistory->getActivityDetails()]);
    }

    /** + updateActivity(description: String) endpoint */
    public function updateActivity(Request $request, NonAcademicHistory $nonAcademicHistory): JsonResponse
    {
        $data = $request->validate(['description' => 'required|string']);
        $nonAcademicHistory->updateActivity($data['description']);
        return response()->json($nonAcademicHistory->fresh());
    }

    public function update(Request $request, NonAcademicHistory $nonAcademicHistory): JsonResponse
    {
        $data = $request->validate([
            'activity_title' => 'sometimes|string|max:200',
            'category'       => 'nullable|string|max:100',
            'description'    => 'nullable|string',
            'date_started'   => 'nullable|date',
            'date_ended'     => 'nullable|date',
            'role'           => 'nullable|string|max:100',
            'organizer'      => 'nullable|string|max:150',
            'game_result'    => 'nullable|string|max:150',
        ]);
        $nonAcademicHistory->update($data);
        return response()->json($nonAcademicHistory);
    }

    public function destroy(NonAcademicHistory $nonAcademicHistory): JsonResponse
    {
        $nonAcademicHistory->delete();
        return response()->json(['message' => 'Non-academic history deleted.']);
    }
}
