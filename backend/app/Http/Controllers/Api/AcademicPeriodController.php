<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicPeriodController extends Controller
{
    /**
     * GET /api/academic-period/active
     * Public — students and faculty can read the active period.
     */
    public function active(): JsonResponse
    {
        $period = AcademicPeriod::active();
        if (!$period) {
            return response()->json(['message' => 'No active period set.'], 404);
        }
        return response()->json($period);
    }

    /**
     * GET /api/admin/academic-period
     * List all periods (admin).
     */
    public function index(): JsonResponse
    {
        return response()->json(AcademicPeriod::orderBy('school_year', 'desc')->orderBy('semester', 'desc')->get());
    }

    /**
     * POST /api/admin/academic-period
     * Admin sets a specific period as active.
     * Body: { school_year: "2025-2026", semester: "2nd" }
     */
    public function setActive(Request $request): JsonResponse
    {
        $data = $request->validate([
            'school_year' => 'required|string|regex:/^\d{4}-\d{4}$/',
            'semester'    => 'required|in:1st,2nd',
        ]);

        DB::transaction(function () use ($data) {
            // Deactivate all
            AcademicPeriod::where('is_active', true)->update(['is_active' => false]);

            // Find or create the target period and activate it
            AcademicPeriod::updateOrCreate(
                ['school_year' => $data['school_year'], 'semester' => $data['semester']],
                ['is_active' => true]
            );
        });

        return response()->json(AcademicPeriod::active());
    }

    /**
     * POST /api/admin/academic-period/advance
     * Admin advances to the next semester automatically.
     */
    public function advance(): JsonResponse
    {
        $current = AcademicPeriod::active();

        if (!$current) {
            return response()->json(['message' => 'No active period to advance from.'], 422);
        }

        $next = $current->nextPeriod();

        DB::transaction(function () use ($current, $next) {
            $current->update(['is_active' => false]);
            AcademicPeriod::updateOrCreate(
                ['school_year' => $next['school_year'], 'semester' => $next['semester']],
                ['is_active' => true]
            );
        });

        return response()->json([
            'previous' => $current,
            'current'  => AcademicPeriod::active(),
        ]);
    }
}
