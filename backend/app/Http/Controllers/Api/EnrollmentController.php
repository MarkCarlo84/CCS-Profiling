<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicRecord;
use App\Models\Grade;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * Valid grades in the Philippine grading system used by this institution.
     * 1.00–3.00 = Passed, 5.00 = Failed
     * INC / IP / OD / UD are special status strings.
     */
    const VALID_GRADES = [1.00, 1.25, 1.50, 2.00, 2.25, 2.50, 3.00, 5.00];
    const PASSING_GRADE = 3.00;

    const SEMESTER_ORDER = [
        '1st' => 1,
        '2nd' => 2,
        'Summer' => 3,
    ];

    /**
     * POST /api/admin/students/{student}/enroll-subjects
     * Admin assigns subjects to a student for a given school year + semester.
     * Creates the AcademicRecord if it doesn't exist yet, then adds Grade stubs.
     */
    public function enrollSubjects(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'school_year' => 'required|string|max:20',
            'semester'    => 'required|in:1st,2nd,Summer',
            'year_level'  => 'required|integer|min:1|max:6',
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        // Find or create the AcademicRecord for this period
        $record = AcademicRecord::firstOrCreate(
            [
                'student_id'  => $student->id,
                'school_year' => $data['school_year'],
                'semester'    => $data['semester'],
            ],
            ['year_level' => $data['year_level'], 'gpa' => null]
        );

        $added = [];
        $skipped = [];

        foreach ($data['subject_ids'] as $subjectId) {
            // Avoid duplicate grade entries for the same subject in the same record
            $exists = Grade::where('academic_record_id', $record->id)
                ->where('subject_id', $subjectId)
                ->exists();

            if ($exists) {
                $skipped[] = $subjectId;
                continue;
            }

            $subject = Subject::find($subjectId);

            // Pre-requisite check
            if ($subject->pre_requisite) {
                $prereqPassed = $this->hasPassedPrerequisite($student, $subject->pre_requisite);
                if (!$prereqPassed) {
                    return response()->json([
                        'message'     => "Student has not passed the pre-requisite for subject: {$subject->subject_name}.",
                        'pre_requisite' => $subject->pre_requisite,
                    ], 422);
                }
            }

            $added[] = Grade::create([
                'academic_record_id' => $record->id,
                'subject_id'         => $subjectId,
                'subject_name'       => $subject->subject_name,
                'score'              => null,
                'remarks'            => 'IP', // In Progress
            ]);
        }

        return response()->json([
            'academic_record' => $record->load('grades.subject'),
            'added_count'     => count($added),
            'skipped_count'   => count($skipped),
            'skipped_ids'     => $skipped,
        ], 201);
    }

    /**
     * POST /api/admin/students/{student}/promote
     * Checks if all grades in the current semester are passed,
     * then auto-enrolls the student into the next semester's subjects
     * based on the Subject table (year_level + semester fields).
     */
    public function promote(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'from_school_year' => 'required|string|max:20',
            'from_semester'    => 'required|in:1st,2nd,Summer',
            'from_year_level'  => 'required|integer|min:1|max:6',
            'to_school_year'   => 'required|string|max:20',
        ]);

        $currentRecord = AcademicRecord::where('student_id', $student->id)
            ->where('school_year', $data['from_school_year'])
            ->where('semester', $data['from_semester'])
            ->with('grades')
            ->first();

        if (!$currentRecord) {
            return response()->json(['message' => 'No academic record found for the specified period.'], 404);
        }

        if ($currentRecord->grades->isEmpty()) {
            return response()->json(['message' => 'No grades found for this semester.'], 422);
        }

        // Check all grades are finalized and passed
        $failed = $currentRecord->grades->filter(function ($grade) {
            // INC, IP, OD, UD are not finalized
            if (in_array($grade->remarks, ['INC', 'IP', 'OD', 'UD'])) return true;
            // 5.00 = failed
            return (float) $grade->score === 5.00;
        });

        if ($failed->isNotEmpty()) {
            return response()->json([
                'message'       => 'Student cannot be promoted. Some subjects are not passed or still in progress.',
                'failed_grades' => $failed->values(),
            ], 422);
        }

        // Determine next semester and year level
        [$nextYearLevel, $nextSemester] = $this->getNextPeriod(
            $data['from_year_level'],
            $data['from_semester']
        );

        if ($nextYearLevel === null) {
            return response()->json(['message' => 'Student has completed all year levels. Mark as graduated.'], 200);
        }

        // Pull subjects for the next period from the Subject table
        // Subjects are stored as "3rd Year" / "1st Semester" format
        $yearLabel    = $this->yearLabel($nextYearLevel);
        $semLabel     = $this->semLabel($nextSemester);
        $programLabel = $this->programLabel($student->department ?? '');

        $subjects = Subject::where('year_level', $yearLabel)
            ->where('semester', $semLabel)
            ->where('program', $programLabel)
            ->get();

        if ($subjects->isEmpty()) {
            return response()->json([
                'message' => "No subjects found for Year {$nextYearLevel} - {$nextSemester} semester. Please add subjects first.",
            ], 422);
        }

        // Create the new AcademicRecord
        $newRecord = AcademicRecord::firstOrCreate(
            [
                'student_id'  => $student->id,
                'school_year' => $data['to_school_year'],
                'semester'    => $nextSemester,
            ],
            ['year_level' => $nextYearLevel, 'gpa' => null]
        );

        $added = 0;
        foreach ($subjects as $subject) {
            $exists = Grade::where('academic_record_id', $newRecord->id)
                ->where('subject_id', $subject->id)
                ->exists();
            if ($exists) continue;

            Grade::create([
                'academic_record_id' => $newRecord->id,
                'subject_id'         => $subject->id,
                'subject_name'       => $subject->subject_name,
                'score'              => null,
                'remarks'            => 'IP',
            ]);
            $added++;
        }

        return response()->json([
            'message'         => "Student promoted to Year {$nextYearLevel} - {$nextSemester} semester.",
            'academic_record' => $newRecord->load('grades.subject'),
            'subjects_added'  => $added,
        ], 201);
    }

    /**
     * Determine the next year level and semester.
     * Max year level is 4 (adjust if needed for 5-year courses).
     */
    private function getNextPeriod(int $yearLevel, string $semester): array
    {
        if ($semester === '1st') return [$yearLevel, '2nd'];
        if ($semester === '2nd') {
            if ($yearLevel >= 4) return [null, null]; // graduated
            return [$yearLevel + 1, '1st'];
        }
        // Summer → next year 1st sem
        return [$yearLevel + 1, '1st'];
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

    /**
     * Check if the student has passed the pre-requisite subject by subject_code or subject_name.
     */
    private function hasPassedPrerequisite(Student $student, string $prereq): bool
    {
        $prereqSubject = Subject::where('subject_code', $prereq)
            ->orWhere('subject_name', $prereq)
            ->first();

        if (!$prereqSubject) return true; // can't find it, allow through

        return Grade::whereHas('academicRecord', fn($q) => $q->where('student_id', $student->id))
            ->where('subject_id', $prereqSubject->id)
            ->where('score', '<=', self::PASSING_GRADE)
            ->whereNotIn('remarks', ['INC', 'IP', 'OD', 'UD'])
            ->exists();
    }
}
