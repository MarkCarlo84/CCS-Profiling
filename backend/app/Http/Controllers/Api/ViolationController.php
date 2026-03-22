<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Violation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ViolationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Violation::with('student');
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->filled('severity_level')) {
            $query->where('severity_level', $request->severity_level);
        }
        if ($request->filled('search')) {
            $query->where('violation_type', 'like', "%{$request->search}%");
        }
        return response()->json($query->orderBy('date_committed', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id'     => 'required|exists:students,id',
            'violation_type' => 'required|string|max:100',
            'description'    => 'nullable|string',
            'date_committed' => 'nullable|date',
            'severity_level' => 'in:minor,major,grave',
            'action_taken'   => 'nullable|string',
        ]);
        $violation = Violation::create($data);
        return response()->json($violation->load('student'), 201);
    }

    public function show(Violation $violation): JsonResponse
    {
        return response()->json($violation->load('student'));
    }

    /** + getViolationDetails() endpoint */
    public function violationDetails(Violation $violation): JsonResponse
    {
        return response()->json(['details' => $violation->getViolationDetails()]);
    }

    /** + updateAction(action: String) endpoint */
    public function updateAction(Request $request, Violation $violation): JsonResponse
    {
        $data = $request->validate(['action_taken' => 'required|string']);
        $violation->updateAction($data['action_taken']);
        return response()->json($violation->fresh());
    }

    public function update(Request $request, Violation $violation): JsonResponse
    {
        $data = $request->validate([
            'violation_type' => 'sometimes|string|max:100',
            'description'    => 'nullable|string',
            'date_committed' => 'nullable|date',
            'severity_level' => 'in:minor,major,grave',
            'action_taken'   => 'nullable|string',
        ]);
        $violation->update($data);
        return response()->json($violation);
    }

    public function destroy(Violation $violation): JsonResponse
    {
        $violation->delete();
        return response()->json(['message' => 'Violation deleted.']);
    }
}
