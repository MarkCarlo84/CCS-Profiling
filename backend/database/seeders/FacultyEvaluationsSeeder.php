<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FacultyEvaluation;
use App\Models\Faculty;
use App\Models\Student;

class FacultyEvaluationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faculties = Faculty::all();
        $students = Student::take(100)->get();

        if ($faculties->isEmpty() || $students->isEmpty()) {
            $this->command->warn('No faculty members or students found.');
            return;
        }

        $commentTemplates = [
            'Excellent teacher who explains concepts clearly and is always willing to help students.',
            'Very knowledgeable in the subject matter and makes learning engaging and interactive.',
            'Great communication skills and provides constructive feedback on assignments.',
            'Patient and understanding instructor who creates a positive learning environment.',
            'Well-prepared for classes and uses effective teaching methods.',
            'Encourages student participation and makes complex topics easy to understand.',
            'Professional and approachable, always available during office hours.',
            'Uses real-world examples that help connect theory to practice.',
            'Fair in grading and provides detailed feedback on student work.',
            'Inspiring teacher who motivates students to excel in their studies.',
            'Good instructor overall, but could improve on providing more timely feedback.',
            'Knowledgeable but sometimes moves too quickly through difficult concepts.',
            'Helpful during consultations, though could be more engaging during lectures.',
            'Clear explanations but could benefit from more interactive teaching methods.',
            'Professional and competent, but could provide more practical examples.',
            'Good subject mastery but could improve on classroom management.',
            'Effective teacher but could be more responsive to student questions.',
            'Well-organized classes but could incorporate more hands-on activities.',
            'Knowledgeable instructor who could benefit from using more visual aids.',
            'Good overall but could provide clearer instructions for assignments.',
            'Demonstrates good subject knowledge but communication could be clearer.',
            'Helpful and professional, though teaching pace could be adjusted.',
            'Shows expertise in the field but could improve student engagement techniques.',
            'Fair and consistent grading, but could provide more detailed explanations.',
            'Good preparation for classes but could be more flexible with different learning styles.',
        ];

        $schoolYears = ['2025-2026', '2024-2025'];
        $semesters   = ['1st Semester', '2nd Semester'];
        $now         = now()->toDateTimeString();

        // Build a set of existing combos to avoid duplicates
        $existing = \Illuminate\Support\Facades\DB::table('faculty_evaluations')
            ->select('faculty_id', 'student_id', 'school_year', 'semester')
            ->get()
            ->map(fn($r) => "{$r->faculty_id}|{$r->student_id}|{$r->school_year}|{$r->semester}")
            ->flip()
            ->toArray();

        $rows = [];

        foreach ($faculties as $faculty) {
            $evaluatingStudents = $students->random(min(20, $students->count()));

            foreach ($evaluatingStudents as $student) {
                $numEvals = rand(1, 2);
                for ($i = 0; $i < $numEvals; $i++) {
                    $sy  = $schoolYears[array_rand($schoolYears)];
                    $sem = $semesters[array_rand($semesters)];
                    $key = "{$faculty->id}|{$student->id}|{$sy}|{$sem}";

                    if (isset($existing[$key])) continue;
                    $existing[$key] = true;

                    $base = rand(3, 5);
                    $avg  = ($base + rand(3,5) + rand(3,5) + rand(3,5) + rand(3,5)) / 5;
                    $ci   = $avg >= 4.5 ? rand(0,9) : ($avg >= 3.5 ? rand(5,19) : rand(10,24));

                    $rows[] = [
                        'faculty_id'             => $faculty->id,
                        'student_id'             => $student->id,
                        'teaching_effectiveness' => max(1, min(5, $base + rand(-1,1))),
                        'communication'          => max(1, min(5, $base + rand(-1,1))),
                        'professionalism'        => max(1, min(5, $base + rand(-1,1))),
                        'subject_mastery'        => max(1, min(5, $base + rand(-1,1))),
                        'student_engagement'     => max(1, min(5, $base + rand(-1,1))),
                        'comments'               => $commentTemplates[$ci],
                        'school_year'            => $sy,
                        'semester'               => $sem,
                        'created_at'             => $now,
                        'updated_at'             => $now,
                    ];
                }
            }
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            \Illuminate\Support\Facades\DB::table('faculty_evaluations')->insertOrIgnore($chunk);
        }

        $this->command->info('✓ Created ' . count($rows) . ' faculty evaluations');
    }
}