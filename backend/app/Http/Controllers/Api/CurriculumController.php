<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CurriculumController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Curriculum::with('department');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('year_implemented')) {
            $query->where('year_implemented', $request->year_implemented);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('code', 'like', "%$s%");
            });
        }

        return response()->json($query->orderBy('year_implemented', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'department_id'    => 'required|exists:departments,id',
            'code'             => 'required|string|max:30|unique:curricula',
            'name'             => 'required|string|max:200',
            'description'      => 'nullable|string',
            'year_implemented' => 'required|integer|min:2000|max:2100',
            'status'           => 'in:active,archived',
        ]);

        $curriculum = Curriculum::create($data);
        return response()->json($curriculum->load('department'), 201);
    }

    public function show(Curriculum $curriculum): JsonResponse
    {
        return response()->json($curriculum->load(['department', 'syllabi.course', 'syllabi.faculty']));
    }

    public function update(Request $request, Curriculum $curriculum): JsonResponse
    {
        $data = $request->validate([
            'department_id'    => 'sometimes|exists:departments,id',
            'code'             => "sometimes|string|max:30|unique:curricula,code,{$curriculum->id}",
            'name'             => 'sometimes|string|max:200',
            'description'      => 'nullable|string',
            'year_implemented' => 'sometimes|integer|min:2000|max:2100',
            'status'           => 'in:active,archived',
        ]);

        $curriculum->update($data);
        return response()->json($curriculum->load('department'));
    }

    public function destroy(Curriculum $curriculum): JsonResponse
    {
        $curriculum->delete();
        return response()->json(['message' => 'Curriculum deleted.']);
    }
}
