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
        $query = Skill::with('student');
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->filled('skill_level')) {
            $query->where('skill_level', $request->skill_level);
        }
        if ($request->filled('certification')) {
            $query->where('certification', filter_var($request->certification, FILTER_VALIDATE_BOOLEAN));
        }
        return response()->json($query->orderBy('skill_name')->get());
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
