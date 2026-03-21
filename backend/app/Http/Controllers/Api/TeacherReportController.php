<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherReportController extends Controller
{
    private function getFacultyId(Request $request): ?int
    {
        return $request->user()->faculty_id;
    }

    /** GET /api/teacher/reports */
    public function index(Request $request): JsonResponse
    {
        $facultyId = $this->getFacultyId($request);
        $reports = Report::where('faculty_id', $facultyId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($reports);
    }

    /** POST /api/teacher/reports */
    public function store(Request $request): JsonResponse
    {
        $facultyId = $this->getFacultyId($request);
        if (!$facultyId) {
            return response()->json(['message' => 'No faculty profile linked.'], 403);
        }

        $data = $request->validate([
            'title'           => 'required|string|max:200',
            'report_type'     => 'nullable|string|max:100',
            'subject_student' => 'nullable|string|max:200',
            'content'         => 'required|string',
            'status'          => 'in:draft,submitted',
            'report_date'     => 'nullable|date',
        ]);

        $data['faculty_id'] = $facultyId;
        $data['status'] = $data['status'] ?? 'draft';
        $data['report_date'] = $data['report_date'] ?? now()->toDateString();

        $report = Report::create($data);
        return response()->json($report, 201);
    }

    /** GET /api/teacher/reports/{report} */
    public function show(Request $request, Report $report): JsonResponse
    {
        if ($report->faculty_id !== $this->getFacultyId($request)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        return response()->json($report);
    }

    /** PATCH /api/teacher/reports/{report} */
    public function update(Request $request, Report $report): JsonResponse
    {
        if ($report->faculty_id !== $this->getFacultyId($request)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'title'           => 'sometimes|string|max:200',
            'report_type'     => 'nullable|string|max:100',
            'subject_student' => 'nullable|string|max:200',
            'content'         => 'sometimes|string',
            'status'          => 'in:draft,submitted',
            'report_date'     => 'nullable|date',
        ]);

        $report->update($data);
        return response()->json($report);
    }

    /** DELETE /api/teacher/reports/{report} */
    public function destroy(Request $request, Report $report): JsonResponse
    {
        if ($report->faculty_id !== $this->getFacultyId($request)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        $report->delete();
        return response()->json(['message' => 'Report deleted.']);
    }

    /** GET /api/admin/faculty-reports — admin sees all reports with faculty info */
    public function adminIndex(): JsonResponse
    {
        $reports = Report::with('faculty:id,first_name,last_name,department,position')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($reports);
    }
}
