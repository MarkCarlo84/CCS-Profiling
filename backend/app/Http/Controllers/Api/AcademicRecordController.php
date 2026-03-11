<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicRecord;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AcademicRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AcademicRecord::with(['student', 'grades.subject']);
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->filled('school_year')) {
            $query->where('school_year', $request->school_year);
        }
        return response()->json($query->orderBy('school_year', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id'  => 'required|exists:students,id',
            'school_year' => 'required|string|max:20',
            'semester'    => 'nullable|string|max:30',
            'gpa'         => 'nullable|numeric|min:0|max:5',
        ]);
        $record = AcademicRecord::create($data);
        return response()->json($record->load(['student', 'grades']), 201);
    }

    public function show(AcademicRecord $academicRecord): JsonResponse
    {
        return response()->json($academicRecord->load(['student', 'grades.subject']));
    }

    /** + calculateGPA() endpoint */
    public function calculateGPA(AcademicRecord $academicRecord): JsonResponse
    {
        $gpa = $academicRecord->calculateGPA();
        return response()->json(['gpa' => $gpa, 'record' => $academicRecord->fresh()]);
    }

    /** + addGrade(grade: Grade) endpoint */
    public function addGrade(Request $request, AcademicRecord $academicRecord): JsonResponse
    {
        $data = $request->validate([
            'subject_id'   => 'nullable|exists:subjects,id',
            'subject_name' => 'nullable|string|max:200',
            'score'        => 'required|numeric|min:0|max:5',
            'remarks'      => 'nullable|string|max:100',
        ]);
        $grade = Grade::create(array_merge($data, ['academic_record_id' => $academicRecord->id]));
        $academicRecord->calculateGPA();
        return response()->json($grade->load('subject'), 201);
    }

    /** + getGPA() endpoint */
    public function getGPA(AcademicRecord $academicRecord): JsonResponse
    {
        return response()->json(['gpa' => $academicRecord->getGPA()]);
    }

    public function update(Request $request, AcademicRecord $academicRecord): JsonResponse
    {
        $data = $request->validate([
            'school_year' => 'sometimes|string|max:20',
            'semester'    => 'nullable|string|max:30',
            'gpa'         => 'nullable|numeric|min:0|max:5',
        ]);
        $academicRecord->update($data);
        return response()->json($academicRecord->load('grades'));
    }

    public function destroy(AcademicRecord $academicRecord): JsonResponse
    {
        $academicRecord->delete();
        return response()->json(['message' => 'Academic record deleted.']);
    }
}
