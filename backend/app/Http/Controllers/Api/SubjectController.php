<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Subject::query();
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) => $q->where('subject_code', 'like', "%$s%")
                ->orWhere('subject_name', 'like', "%$s%"));
        }
        return response()->json($query->orderBy('subject_code')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject_code'   => 'required|string|max:30|unique:subjects',
            'subject_name'   => 'required|string|max:200',
            'units'          => 'required|integer|min:1|max:9',
            'pre_requisite'  => 'nullable|string|max:200',
        ]);
        return response()->json(Subject::create($data), 201);
    }

    public function show(Subject $subject): JsonResponse
    {
        return response()->json($subject->load('grades'));
    }

    /** + getSubjectInfo() endpoint */
    public function info(Subject $subject): JsonResponse
    {
        return response()->json(['info' => $subject->getSubjectInfo()]);
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $data = $request->validate([
            'subject_code'  => "sometimes|string|max:30|unique:subjects,subject_code,{$subject->id}",
            'subject_name'  => 'sometimes|string|max:200',
            'units'         => 'sometimes|integer|min:1|max:9',
            'pre_requisite' => 'nullable|string|max:200',
        ]);
        $subject->update($data);
        return response()->json($subject);
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $subject->delete();
        return response()->json(['message' => 'Subject deleted.']);
    }
}
