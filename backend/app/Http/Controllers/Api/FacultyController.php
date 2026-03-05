<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FacultyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Faculty::with('department');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%$search%")
                  ->orWhere('last_name', 'like', "%$search%")
                  ->orWhere('employee_number', 'like', "%$search%");
            });
        }

        return response()->json($query->orderBy('last_name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'department_id'     => 'required|exists:departments,id',
            'employee_number'   => 'required|unique:faculties',
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'middle_name'       => 'nullable|string|max:100',
            'position'          => 'required|string|max:100',
            'employment_type'   => 'in:full_time,part_time,contractual',
            'specialization'    => 'nullable|string|max:150',
            'highest_education' => 'nullable|string|max:100',
            'email'             => 'nullable|email',
            'phone'             => 'nullable|string|max:30',
            'date_hired'        => 'nullable|date',
            'status'            => 'in:active,inactive,on_leave',
            'remarks'           => 'nullable|string',
        ]);
        $faculty = Faculty::create($data);
        return response()->json($faculty->load('department'), 201);
    }

    public function show(Faculty $faculty): JsonResponse
    {
        return response()->json($faculty->load('department'));
    }

    public function update(Request $request, Faculty $faculty): JsonResponse
    {
        $data = $request->validate([
            'department_id'     => 'sometimes|exists:departments,id',
            'employee_number'   => "sometimes|unique:faculties,employee_number,{$faculty->id}",
            'first_name'        => 'sometimes|string|max:100',
            'last_name'         => 'sometimes|string|max:100',
            'middle_name'       => 'nullable|string|max:100',
            'position'          => 'sometimes|string|max:100',
            'employment_type'   => 'in:full_time,part_time,contractual',
            'specialization'    => 'nullable|string|max:150',
            'highest_education' => 'nullable|string|max:100',
            'email'             => 'nullable|email',
            'phone'             => 'nullable|string|max:30',
            'date_hired'        => 'nullable|date',
            'status'            => 'in:active,inactive,on_leave',
            'remarks'           => 'nullable|string',
        ]);
        $faculty->update($data);
        return response()->json($faculty->load('department'));
    }

    public function destroy(Faculty $faculty): JsonResponse
    {
        $faculty->delete();
        return response()->json(['message' => 'Faculty deleted.']);
    }
}
