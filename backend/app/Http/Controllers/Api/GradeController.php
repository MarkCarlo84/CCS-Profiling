<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\AcademicRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GradeController extends Controller
{
    /**
     * Validation rule for the Philippine grading system.
     * Allowed numeric scores: 1.00, 1.25, 1.50, 2.00, 2.25, 2.50, 3.00, 5.00
     */
    private function scoreRule(): string
    {
        return 'in:1.00,1.25,1.50,2.00,2.25,2.50,3.00,5.00';
    }

    public function index(Request $request): JsonResponse
    {
        $query = Grade::with(['subject', 'academicRecord.student']);
        if ($request->filled('academic_record_id')) {
            $query->where('academic_record_id', $request->academic_record_id);
        }
        if ($request->filled('student_id')) {
            // Use a subquery instead of whereHas to avoid extra COUNT overhead
            $query->whereIn('academic_record_id', function ($sub) use ($request) {
                $sub->select('id')->from('academic_records')->where('student_id', $request->student_id);
            });
        }
        if ($request->filled('per_page')) {
            $perPage = min((int) $request->input('per_page'), 500);
            return response()->json($query->paginate($perPage));
        }
        return response()->json($query->get());
    }

    /** Admin: add a grade to an academic record */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'academic_record_id' => 'required|exists:academic_records,id',
            'subject_id'         => 'nullable|exists:subjects,id',
            'subject_name'       => 'nullable|string|max:200',
            'score'              => ['nullable', $this->scoreRule()],
            'remarks'            => 'nullable|in:INC,IP,OD,UD',
        ]);

        $data['remarks'] = $data['remarks'] ?? 'IP';

        $grade = Grade::create($data);
        $grade->academicRecord->calculateGPA();
        return response()->json($grade->load(['subject', 'academicRecord']), 201);
    }

    public function show(Grade $grade): JsonResponse
    {
        return response()->json($grade->load(['subject', 'academicRecord.student']));
    }

    /** + computeRemarks() endpoint */
    public function computeRemarks(Grade $grade): JsonResponse
    {
        return response()->json(['remarks' => $grade->computeRemarks()]);
    }

    /** + getScore() endpoint */
    public function getScore(Grade $grade): JsonResponse
    {
        return response()->json(['score' => $grade->getScore()]);
    }

    /** Admin: update a grade (score and/or special remarks) */
    public function update(Request $request, Grade $grade): JsonResponse
    {
        $data = $request->validate([
            'subject_id'   => 'nullable|exists:subjects,id',
            'subject_name' => 'nullable|string|max:200',
            'score'        => ['nullable', $this->scoreRule()],
            'remarks'      => 'nullable|in:INC,IP,OD,UD',
        ]);

        // If a numeric score is set, clear special remarks
        if (isset($data['score']) && !is_null($data['score'])) {
            $data['remarks'] = $grade->computeRemarks();
        }

        $grade->update($data);
        $grade->academicRecord->calculateGPA();
        return response()->json($grade->load('subject'));
    }

    public function destroy(Grade $grade): JsonResponse
    {
        $record = $grade->academicRecord;
        $grade->delete();
        $record->calculateGPA();
        return response()->json(['message' => 'Grade deleted.']);
    }
}
