<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Student::with(['department', 'affiliations', 'violations', 'academicRecords', 'nonAcademicRecords', 'skills']);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('year_level')) {
            $query->where('year_level', $request->year_level);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('student_number', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('last_name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'department_id'  => 'required|exists:departments,id',
            'student_number' => 'required|unique:students',
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'year_level'     => 'required|in:1st Year,2nd Year,3rd Year,4th Year',
            'section'        => 'nullable|string|max:20',
            'email'          => 'nullable|email',
            'phone'          => 'nullable|string|max:30',
            'birthdate'      => 'nullable|date',
            'address'        => 'nullable|string',
            'gender'         => 'nullable|in:Male,Female,Other',
            'gpa'            => 'nullable|numeric|min:0|max:5',
            'status'         => 'in:active,inactive,graduated,dropped',
            'remarks'        => 'nullable|string',
        ]);
        $student = Student::create($data);
        return response()->json($student->load(['department', 'affiliations', 'violations', 'academicRecords', 'nonAcademicRecords', 'skills']), 201);
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json($student->load(['department', 'affiliations', 'violations', 'academicRecords', 'nonAcademicRecords', 'skills']));
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'department_id'  => 'sometimes|exists:departments,id',
            'student_number' => "sometimes|unique:students,student_number,{$student->id}",
            'first_name'     => 'sometimes|string|max:100',
            'last_name'      => 'sometimes|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'year_level'     => 'sometimes|in:1st Year,2nd Year,3rd Year,4th Year',
            'section'        => 'nullable|string|max:20',
            'email'          => 'nullable|email',
            'phone'          => 'nullable|string|max:30',
            'birthdate'      => 'nullable|date',
            'address'        => 'nullable|string',
            'gender'         => 'nullable|in:Male,Female,Other',
            'gpa'            => 'nullable|numeric|min:0|max:5',
            'status'         => 'in:active,inactive,graduated,dropped',
            'remarks'        => 'nullable|string',
        ]);
        $student->update($data);
        return response()->json($student->load(['department', 'affiliations', 'violations', 'academicRecords', 'nonAcademicRecords', 'skills']));
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->delete();
        return response()->json(['message' => 'Student deleted.']);
    }
}
