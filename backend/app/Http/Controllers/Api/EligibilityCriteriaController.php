<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EligibilityCriteria;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EligibilityCriteriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EligibilityCriteria::query();
        
        if ($request->has('limit')) {
            $paginated = $query->paginate($request->get('limit'));
            return response()->json([
                'data'         => $paginated->items(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
            ]);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'criteria_id'             => 'nullable|string|max:50',
            'minimum_gpa'             => 'required|numeric|min:0|max:5',
            'required_skill'          => 'nullable|string|max:100',
            'required_affiliation_type' => 'nullable|string|max:100',
            'max_allowed_violations'  => 'required|integer|min:0',
        ]);
        return response()->json(EligibilityCriteria::create($data), 201);
    }

    public function show(EligibilityCriteria $eligibilityCriterion): JsonResponse
    {
        return response()->json($eligibilityCriterion);
    }

    /**
     * + evaluate(student: Student) : boolean
     * POST /api/eligibility-criteria/{id}/evaluate/{studentId}
     */
    public function evaluate(EligibilityCriteria $eligibilityCriterion, Student $student): JsonResponse
    {
        $passed = $eligibilityCriterion->evaluate($student);
        return response()->json([
            'student_id' => $student->id,
            'student'    => $student->full_name,
            'criteria'   => $eligibilityCriterion->toArray(),
            'passed'     => $passed,
        ]);
    }

    public function update(Request $request, EligibilityCriteria $eligibilityCriterion): JsonResponse
    {
        $data = $request->validate([
            'criteria_id'             => 'nullable|string|max:50',
            'minimum_gpa'             => 'sometimes|numeric|min:0|max:5',
            'required_skill'          => 'nullable|string|max:100',
            'required_affiliation_type' => 'nullable|string|max:100',
            'max_allowed_violations'  => 'sometimes|integer|min:0',
        ]);
        $eligibilityCriterion->update($data);
        return response()->json($eligibilityCriterion);
    }

    public function destroy(EligibilityCriteria $eligibilityCriterion): JsonResponse
    {
        $eligibilityCriterion->delete();
        return response()->json(['message' => 'Criteria deleted.']);
    }
}
