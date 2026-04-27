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
        $perPage = $request->get('limit', 5);

        // Base constraints
        $baseQuery = Affiliation::with('student');
        if ($request->filled('student_id')) {
            $baseQuery->where('student_id', $request->student_id);
        }
        if ($request->filled('search')) {
            $baseQuery->where('name', 'like', '%' . $request->search . '%');
        }

        // If a specific type/category is requested, paginate that single category
        if ($request->filled('type')) {
            $paginated = (clone $baseQuery)
                ->where('type', $request->type)
                ->orderBy('name')
                ->paginate($perPage, ['*'], 'page');

            return response()->json([
                $request->type => [
                    'data'          => $paginated->items(),
                    'current_page'  => $paginated->currentPage(),
                    'last_page'     => $paginated->lastPage(),
                    'per_page'      => $paginated->perPage(),
                    'total'         => $paginated->total(),
                ],
            ]);
        }

        // Otherwise paginate each category independently
        $types = (clone $baseQuery)->distinct()->pluck('type');

        $result = [];
        foreach ($types as $type) {
            $pageKey   = 'page_' . str_replace(' ', '_', strtolower($type ?? 'uncategorized'));
            $page      = (int) $request->get($pageKey, 1);

            $paginated = (clone $baseQuery)
                ->where('type', $type)
                ->orderBy('name')
                ->paginate($perPage, ['*'], $pageKey, $page);

            $label = $type ?? 'Uncategorized';
            $result[$label] = [
                'data'         => $paginated->items(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ];
        }

        return response()->json($result);
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
