<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicRecord;
use App\Models\Grade;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AcademicRecordController extends Controller
{
    // ── Read (accessible to admin, teacher, student via their own routes) ──────

    public function index(Request $request): JsonResponse
    {
        try {
            $query = AcademicRecord::with(['student', 'grades.subject']);

            if ($request->filled('student_id')) {
                $query->where('student_id', $request->student_id);
            }
            if ($request->filled('school_year')) {
                $query->where('school_year', $request->school_year);
            }
            if ($request->filled('department')) {
                $query->whereHas('student', fn($q) => $q->where('department', $request->department));
            }

            // Hard limit when no specific filter to prevent memory exhaustion
            if (!$request->filled('student_id') && !$request->filled('school_year') && !$request->filled('department')) {
                $query->limit(200);
            }

            $records = $query->orderBy('school_year', 'desc')->get();
            return response()->json($records);
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    public function show(AcademicRecord $academicRecord): JsonResponse
    {
        return response()->json($academicRecord->load(['student', 'grades.subject']));
    }

    public function calculateGPA(AcademicRecord $academicRecord): JsonResponse
    {
        $gpa = $academicRecord->calculateGPA();
        return response()->json(['gpa' => $gpa, 'record' => $academicRecord->fresh()]);
    }

    public function getGPA(AcademicRecord $academicRecord): JsonResponse
    {
        return response()->json(['gpa' => $academicRecord->getGPA()]);
    }

    // ── Write (admin only — enforced via route middleware) ────────────────────

    /**
     * Admin creates an academic record for a student.
     * POST /api/admin/academic-records
     *
     * Accepts student_id_number (the human-readable ID like "2021-00123").
     *
     * If the student is REGULAR and the selected year_level > 1,
     * all previous year/semester records are auto-created with their
     * subjects pulled from the Subject table (year_level + semester fields).
     *
     * Example: selecting Year 3, 1st sem will also create:
     *   Year 1 1st sem, Year 1 2nd sem, Year 2 1st sem, Year 2 2nd sem
     * — each with their subjects as IP grade stubs.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_id_number'          => 'required|string|exists:students,student_id',
            'school_year'                => 'required|string|max:20',
            'semester'                   => 'required|in:1st,2nd,Summer',
            'year_level'                 => 'required|integer|min:1|max:6',
            'gpa'                        => 'nullable|numeric',
            'is_irregular'               => 'nullable|boolean',
            'irregular_from_year'        => 'nullable|integer|min:1|max:6',
            'irregular_from_semester'    => 'nullable|in:1st,2nd,Summer',
            'irregular_subjects'         => 'nullable|array',
            'irregular_subjects.*.year_level'  => 'required|integer',
            'irregular_subjects.*.semester'    => 'required|string',
            'irregular_subjects.*.subjects'    => 'nullable|array',
            'irregular_subjects.*.subjects.*.subject_id'   => 'nullable|integer|exists:subjects,id',
            'irregular_subjects.*.subjects.*.subject_name' => 'nullable|string|max:200',
        ]);

        $student = Student::where('student_id', $data['student_id_number'])->firstOrFail();

        $isIrregular     = !empty($data['is_irregular']);
        $irregFromYear   = $data['irregular_from_year'] ?? $data['year_level'];
        $irregFromSem    = $data['irregular_from_semester'] ?? $data['semester'];
        $isRegular       = !$isIrregular;

        $programLabel = $this->programLabel($student->department ?? '');
        $periods      = $this->buildPeriodList($data['year_level'], $data['semester'], $data['school_year']);

        // Build a lookup: [year_level][semester] => [subjects array] for irregular periods
        $irregSubjectMap = [];
        if ($isIrregular && !empty($data['irregular_subjects'])) {
            foreach ($data['irregular_subjects'] as $entry) {
                $irregSubjectMap[$entry['year_level']][$entry['semester']] = $entry['subjects'] ?? [];
            }
        }

        $created = [];
        $skipped = [];

        // Use database transaction for better performance and data integrity
        \DB::transaction(function () use ($periods, $student, &$created, &$skipped, $data, $isRegular, $irregFromYear, $irregFromSem, $programLabel, $irregSubjectMap) {
            foreach ($periods as $period) {
                $alreadyExists = AcademicRecord::where('student_id', $student->id)
                    ->where('school_year', $period['school_year'])
                    ->where('semester', $period['semester'])
                    ->exists();

                if ($alreadyExists) {
                    $skipped[] = "Year {$period['year_level']} {$period['semester']} sem ({$period['school_year']})";
                    continue;
                }

                $record = AcademicRecord::create([
                    'student_id'  => $student->id,
                    'school_year' => $period['school_year'],
                    'semester'    => $period['semester'],
                    'year_level'  => $period['year_level'],
                    'gpa'         => null,
                ]);

                $isLastPeriod = (
                    $period['year_level'] === $data['year_level'] &&
                    $period['semester']   === $data['semester']
                );

                // Determine if this period is before the irregular point
                $periodIndex      = $this->periodIndex($period['year_level'], $period['semester']);
                $irregStartIndex  = $this->periodIndex($irregFromYear, $irregFromSem);
                $isBeforeIrreg    = $periodIndex < $irregStartIndex;

                // Prepare grades for batch insert
                $gradesToInsert = [];
                $now = now();

                if ($isRegular || $isBeforeIrreg) {
                    // Auto-fill from curriculum — Passed for previous, IP for current
                    $yearLabel = $this->yearLabel($period['year_level']);
                    $semLabel  = $this->semLabel($period['semester']);

                    $subjects = \App\Models\Subject::where('year_level', $yearLabel)
                        ->where('semester', $semLabel)
                        ->where('program', $programLabel)
                        ->get();

                    $isPrevious = !$isLastPeriod;

                    foreach ($subjects as $subject) {
                        $gradesToInsert[] = [
                            'academic_record_id' => $record->id,
                            'subject_id'         => $subject->id,
                            'subject_name'       => $subject->subject_name,
                            'score'              => null,
                            'remarks'            => $isPrevious ? 'Passed' : 'IP',
                            'created_at'         => $now,
                            'updated_at'         => $now,
                        ];
                    }
                } else {
                    // Irregular period — use admin-provided subjects
                    $subs = $irregSubjectMap[$period['year_level']][$period['semester']] ?? [];
                    foreach ($subs as $sub) {
                        $subjectId   = $sub['subject_id'] ?? null;
                        $subjectName = $sub['subject_name'] ?? null;
                        if ($subjectId) {
                            $subject = \App\Models\Subject::find($subjectId);
                            $gradesToInsert[] = [
                                'academic_record_id' => $record->id,
                                'subject_id'         => $subjectId,
                                'subject_name'       => $subject?->subject_name ?? $subjectName,
                                'score'              => null,
                                'remarks'            => 'IP',
                                'created_at'         => $now,
                                'updated_at'         => $now,
                            ];
                        } elseif ($subjectName) {
                            $gradesToInsert[] = [
                                'academic_record_id' => $record->id,
                                'subject_id'         => null,
                                'subject_name'       => $subjectName,
                                'score'              => null,
                                'remarks'            => 'IP',
                                'created_at'         => $now,
                                'updated_at'         => $now,
                            ];
                        }
                    }
                }

                // Batch insert grades for better performance
                if (!empty($gradesToInsert)) {
                    Grade::insert($gradesToInsert);
                }

                $created[] = $record->load('grades.subject');
            }
        });

        return response()->json([
            'message'         => count($created) . ' academic record(s) created.',
            'records_created' => $created,
            'records_skipped' => $skipped,
            'is_regular'      => $isRegular,
        ], 201);
    }

    /** Convert year_level + semester into a sortable integer index */
    private function periodIndex(int $year, string $sem): int
    {
        $semIdx = match ($sem) { '1st' => 0, '2nd' => 1, default => 2 };
        return ($year - 1) * 3 + $semIdx;
    }

    /** Convert integer year level to the stored label e.g. 1 → "1st Year" */
    private function yearLabel(int $year): string
    {
        $suffixes = [1 => '1st', 2 => '2nd', 3 => '3rd', 4 => '4th', 5 => '5th', 6 => '6th'];
        return ($suffixes[$year] ?? $year . 'th') . ' Year';
    }

    /** Convert short semester to the stored label e.g. "1st" → "1st Semester" */
    private function semLabel(string $sem): string
    {
        return match ($sem) {
            '1st'    => '1st Semester',
            '2nd'    => '2nd Semester',
            'Summer' => 'Summer',
            default  => $sem,
        };
    }

    /** Convert student department code to the program name stored in subjects table */
    private function programLabel(string $department): string
    {
        return match (strtoupper($department)) {
            'IT' => 'Information Technology',
            'CS' => 'Computer Science',
            default => $department,
        };
    }

    /**
     * Build an ordered list of all periods from Year 1 1st sem
     * up to and including the selected year_level + semester.
     *
     * School year is back-calculated from the target school year.
     * e.g. target = Year 3 1st sem, school_year = 2025-2026
     *   → Year 1 1st = 2023-2024, Year 1 2nd = 2023-2024
     *   → Year 2 1st = 2024-2025, Year 2 2nd = 2024-2025
     *   → Year 3 1st = 2025-2026
     */
    private function buildPeriodList(int $targetYear, string $targetSemester, string $targetSchoolYear): array
    {
        // Parse the start year from the school year string (e.g. "2025-2026" → 2025)
        $targetStartYear = (int) explode('-', $targetSchoolYear)[0];

        // How many academic years back is Year 1 from the target?
        // Year 3 1st sem → 2 years back; Year 3 2nd sem → 2 years back
        $yearsBack = $targetYear - 1;
        $year1Start = $targetStartYear - $yearsBack;

        $periods = [];
        $semesterOrder = ['1st', '2nd']; // Summer excluded from regular progression

        for ($y = 1; $y <= $targetYear; $y++) {
            $syStart = $year1Start + ($y - 1);
            $schoolYear = "{$syStart}-" . ($syStart + 1);

            foreach ($semesterOrder as $sem) {
                $periods[] = [
                    'year_level'  => $y,
                    'semester'    => $sem,
                    'school_year' => $schoolYear,
                ];

                // Stop exactly at the target period
                if ($y === $targetYear && $sem === $targetSemester) {
                    return $periods;
                }
            }
        }

        return $periods;
    }

    /**
     * Admin updates an academic record (school year, semester, year level).
     * PATCH /api/admin/academic-records/{academicRecord}
     */
    public function update(Request $request, AcademicRecord $academicRecord): JsonResponse
    {
        $data = $request->validate([
            'school_year' => 'sometimes|string|max:20',
            'semester'    => 'sometimes|in:1st,2nd,Summer',
            'year_level'  => 'sometimes|integer|min:1|max:6',
        ]);
        $academicRecord->update($data);
        return response()->json($academicRecord->load(['student', 'grades.subject']));
    }

    /**
     * Admin adds a grade directly to an academic record.
     * POST /api/admin/academic-records/{academicRecord}/add-grade
     *
     * Score must be one of: 1.00, 1.25, 1.50, 2.00, 2.25, 2.50, 3.00, 5.00
     * Special remarks: INC, IP, OD, UD (used when no score yet)
     */
    public function addGrade(Request $request, AcademicRecord $academicRecord): JsonResponse
    {
        $data = $request->validate([
            'subject_id'   => 'nullable|exists:subjects,id',
            'subject_name' => 'nullable|string|max:200',
            'score'        => 'nullable|in:1.00,1.25,1.50,2.00,2.25,2.50,3.00,5.00',
            'remarks'      => 'nullable|in:INC,IP,OD,UD',
        ]);

        $data['remarks'] = $data['remarks'] ?? 'IP';

        $grade = Grade::create(array_merge($data, ['academic_record_id' => $academicRecord->id]));
        $academicRecord->calculateGPA();
        return response()->json($grade->load('subject'), 201);
    }

    /**
     * Admin deletes an academic record and all its grades.
     * DELETE /api/admin/academic-records/{academicRecord}
     */
    public function destroy(AcademicRecord $academicRecord): JsonResponse
    {
        $academicRecord->grades()->delete();
        $academicRecord->delete();
        return response()->json(['message' => 'Academic record and all associated grades deleted.']);
    }
}
