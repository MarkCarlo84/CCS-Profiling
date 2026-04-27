<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SkillController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('limit', 5);

        $baseQuery = Skill::with('student');
        if ($request->filled('student_id')) {
            $baseQuery->where('student_id', $request->student_id);
        }
        if ($request->filled('search')) {
            $baseQuery->where('skill_name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('certification')) {
            $baseQuery->where('certification', filter_var($request->certification, FILTER_VALIDATE_BOOLEAN));
        }

        // Single level requested
        if ($request->filled('skill_level')) {
            $paginated = (clone $baseQuery)
                ->where('skill_level', $request->skill_level)
                ->orderBy('skill_name')
                ->paginate($perPage, ['*'], 'page');

            return response()->json([
                $request->skill_level => [
                    'data'         => $paginated->items(),
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                ],
            ]);
        }

        // All levels paginated independently
        $levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        $result = [];

        foreach ($levels as $level) {
            $pageKey   = 'page_' . $level;
            $page      = (int) $request->get($pageKey, 1);

            $paginated = (clone $baseQuery)
                ->where('skill_level', $level)
                ->orderBy('skill_name')
                ->paginate($perPage, ['*'], $pageKey, $page);

            if ($paginated->total() > 0) {
                $result[$level] = [
                    'data'         => $paginated->items(),
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                ];
            }
        }

        return response()->json($result);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id'   => 'required|exists:students,id',
            'skill_name'   => 'required|string|max:100',
            'skill_level'  => 'in:beginner,intermediate,advanced,expert',
            'certification' => 'boolean',
        ]);
        $data['certification'] = $data['certification'] ?? false;
        return response()->json(Skill::create($data)->load('student'), 201);
    }

    public function show(Skill $skill): JsonResponse
    {
        return response()->json($skill->load('student'));
    }

    /** + getSkillLevel() endpoint */
    public function getSkillLevel(Skill $skill): JsonResponse
    {
        return response()->json(['skill_level' => $skill->getSkillLevel()]);
    }

    /** + updateSkillLevel(level: String) endpoint */
    public function updateSkillLevel(Request $request, Skill $skill): JsonResponse
    {
        $data = $request->validate(['skill_level' => 'required|in:beginner,intermediate,advanced,expert']);
        $skill->updateSkillLevel($data['skill_level']);
        return response()->json($skill->fresh());
    }

    public function update(Request $request, Skill $skill): JsonResponse
    {
        $data = $request->validate([
            'skill_name'    => 'sometimes|string|max:100',
            'skill_level'   => 'in:beginner,intermediate,advanced,expert',
            'certification' => 'boolean',
        ]);
        $skill->update($data);
        return response()->json($skill);
    }

    public function destroy(Skill $skill): JsonResponse
    {
        $skill->delete();
        return response()->json(['message' => 'Skill deleted.']);
    }
}
