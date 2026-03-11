<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\AcademicRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GradeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Grade::with(['subject', 'academicRecord.student']);
        if ($request->filled('academic_record_id')) {
            $query->where('academic_record_id', $request->academic_record_id);
        }
        if ($request->filled('student_id')) {
            $query->whereHas('academicRecord', fn($q) => $q->where('student_id', $request->student_id));
        }
        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'academic_record_id' => 'required|exists:academic_records,id',
            'subject_id'         => 'nullable|exists:subjects,id',
            'subject_name'       => 'nullable|string|max:200',
            'score'              => 'required|numeric|min:0|max:5',
            'remarks'            => 'nullable|string|max:100',
        ]);
        $grade = Grade::create($data);
        // Recalculate GPA for the parent academic record
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

    public function update(Request $request, Grade $grade): JsonResponse
    {
        $data = $request->validate([
            'subject_id'   => 'nullable|exists:subjects,id',
            'subject_name' => 'nullable|string|max:200',
            'score'        => 'sometimes|numeric|min:0|max:5',
            'remarks'      => 'nullable|string|max:100',
        ]);
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
