<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Department::where('is_active', true)->orderBy('code')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:20|unique:departments,code',
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);
        return response()->json(Department::create($data), 201);
    }

    public function show(Department $department): JsonResponse
    {
        return response()->json($department);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $data = $request->validate([
            'code'        => 'sometimes|string|max:20|unique:departments,code,' . $department->id,
            'name'        => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);
        $department->update($data);
        return response()->json($department);
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();
        return response()->json(['message' => 'Department deleted.']);
    }
}
