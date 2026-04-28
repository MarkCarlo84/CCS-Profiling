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
        $students = Student::take(100)->get(); // Use first 100 students for realistic data
        
        if ($faculties->isEmpty() || $students->isEmpty()) {
            $this->command->warn('No faculty members or students found. Please seed faculty and student data first.');
            return;
        }

        $commentTemplates = [
            // Positive comments
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
            
            // Constructive feedback
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
            
            // Mixed feedback
            'Demonstrates good subject knowledge but communication could be clearer.',
            'Helpful and professional, though teaching pace could be adjusted.',
            'Shows expertise in the field but could improve student engagement techniques.',
            'Fair and consistent grading, but could provide more detailed explanations.',
            'Good preparation for classes but could be more flexible with different learning styles.',
        ];

        $schoolYears = ['2025-2026', '2024-2025'];
        $semesters = ['1st Semester', '2nd Semester'];
        
        $evaluationCount = 0;

        // Create evaluations for each faculty member
        foreach ($faculties as $faculty) {
            // Each faculty gets evaluated by 15-25 random students
            $evaluatingStudents = $students->random(rand(15, 25));
            
            foreach ($evaluatingStudents as $student) {
                // Create 1-2 evaluations per student-faculty pair (different semesters)
                $numEvaluations = rand(1, 2);
                
                for ($i = 0; $i < $numEvaluations; $i++) {
                    $schoolYear = $schoolYears[array_rand($schoolYears)];
                    $semester = $semesters[array_rand($semesters)];
                    
                    // Check if evaluation already exists for this combination
                    $exists = FacultyEvaluation::where([
                        'faculty_id' => $faculty->id,
                        'student_id' => $student->id,
                        'school_year' => $schoolYear,
                        'semester' => $semester,
                    ])->exists();
                    
                    if ($exists) continue;
                    
                    // Generate realistic ratings (mostly 3-5, with some variation)
                    $baseRating = rand(3, 5); // Base rating between 3-5
                    $variation = rand(-1, 1); // Small variation for each category
                    
                    $ratings = [
                        'teaching_effectiveness' => max(1, min(5, $baseRating + rand(-1, 1))),
                        'communication' => max(1, min(5, $baseRating + rand(-1, 1))),
                        'professionalism' => max(1, min(5, $baseRating + rand(-1, 1))),
                        'subject_mastery' => max(1, min(5, $baseRating + rand(-1, 1))),
                        'student_engagement' => max(1, min(5, $baseRating + rand(-1, 1))),
                    ];
                    
                    // Select appropriate comment based on average rating
                    $avgRating = array_sum($ratings) / count($ratings);
                    if ($avgRating >= 4.5) {
                        $commentIndex = rand(0, 9); // Positive comments
                    } elseif ($avgRating >= 3.5) {
                        $commentIndex = rand(5, 19); // Mix of positive and constructive
                    } else {
                        $commentIndex = rand(10, 24); // More constructive feedback
                    }
                    
                    FacultyEvaluation::create([
                        'faculty_id' => $faculty->id,
                        'student_id' => $student->id,
                        'teaching_effectiveness' => $ratings['teaching_effectiveness'],
                        'communication' => $ratings['communication'],
                        'professionalism' => $ratings['professionalism'],
                        'subject_mastery' => $ratings['subject_mastery'],
                        'student_engagement' => $ratings['student_engagement'],
                        'comments' => $commentTemplates[$commentIndex],
                        'school_year' => $schoolYear,
                        'semester' => $semester,
                    ]);
                    
                    $evaluationCount++;
                }
            }
        }

        $this->command->info("✓ Created {$evaluationCount} faculty evaluations");
        $this->command->info("✓ Each faculty member has been evaluated by 15-25 students");
        $this->command->info("✓ Evaluations span across 2 school years and semesters");
    }
}