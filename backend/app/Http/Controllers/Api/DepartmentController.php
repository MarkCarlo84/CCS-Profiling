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
        return response()->json(\App\Services\CacheService::getDepartments());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'        => 'required|string|max:20|unique:departments,code',
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);
        
        $department = Department::create($data);
        
        // Clear department cache
        \App\Services\CacheService::clear('departments_list');
        
        return response()->json($department, 201);
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
        
        // Clear department cache
        \App\Services\CacheService::clear('departments_list');
        
        return response()->json($department);
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();
        
        // Clear department cache
        \App\Services\CacheService::clear('departments_list');
        
        return response()->json(['message' => 'Department deleted.']);
    }
}
