<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affiliation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AffiliationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Affiliation::with('student');
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id'  => 'required|exists:students,id',
            'name'        => 'required|string|max:200',
            'type'        => 'nullable|string|max:100',
            'role'        => 'nullable|string|max:100',
            'date_joined' => 'nullable|date',
        ]);
        $affiliation = Affiliation::create($data);
        return response()->json($affiliation->load('student'), 201);
    }

    public function show(Affiliation $affiliation): JsonResponse
    {
        return response()->json($affiliation->load('student'));
    }

    /** + getAffiliationDetails() endpoint */
    public function details(Affiliation $affiliation): JsonResponse
    {
        return response()->json(['details' => $affiliation->getAffiliationDetails()]);
    }

    public function update(Request $request, Affiliation $affiliation): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:200',
            'type'        => 'nullable|string|max:100',
            'role'        => 'nullable|string|max:100',
            'date_joined' => 'nullable|date',
        ]);
        $affiliation->update($data);
        return response()->json($affiliation);
    }

    public function destroy(Affiliation $affiliation): JsonResponse
    {
        $affiliation->delete();
        return response()->json(['message' => 'Affiliation deleted.']);
    }
}
