<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Report;
use App\Models\Faculty;

class FacultyReportsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faculties = Faculty::all();
        
        if ($faculties->isEmpty()) {
            $this->command->warn('No faculty members found. Please seed faculty data first.');
            return;
        }

        $reportTemplates = [
            [
                'title' => 'Mid-term Academic Progress Report',
                'report_type' => 'Academic Report',
                'subject_student' => 'BSIT 3-A Class',
                'content' => 'This report provides an overview of the academic progress of BSIT 3-A students during the mid-term period. Overall performance has been satisfactory with 85% of students maintaining passing grades. Key observations include improved participation in programming exercises and better understanding of database concepts. However, some students are struggling with advanced algorithms and may need additional support. Recommendations include organizing peer tutoring sessions and providing supplementary materials for complex topics.',
                'status' => 'submitted',
            ],
            [
                'title' => 'Student Behavioral Incident Report',
                'report_type' => 'Behavioral Report',
                'subject_student' => 'Juan Dela Cruz',
                'content' => 'This report documents a behavioral incident involving student Juan Dela Cruz on March 15, 2026. The student was observed disrupting class discussions and showing disrespectful behavior towards classmates during group activities. When approached, the student was uncooperative and argumentative. This is the second incident this semester. Recommended actions include counseling session with the guidance office and a meeting with parents to discuss behavioral expectations and support strategies.',
                'status' => 'submitted',
            ],
            [
                'title' => 'Laboratory Equipment Maintenance Report',
                'report_type' => 'General Report',
                'subject_student' => 'Computer Laboratory 1',
                'content' => 'Monthly maintenance report for Computer Laboratory 1. All 30 workstations have been inspected and tested. Issues identified: 3 computers with slow boot times requiring SSD upgrades, 2 monitors with display flickering, and 1 keyboard with non-functional keys. Network connectivity is stable with average speed of 50 Mbps. Software updates completed for all development environments including Visual Studio, Eclipse, and database management systems. Recommended budget allocation for hardware replacements: PHP 45,000.',
                'status' => 'draft',
            ],
            [
                'title' => 'Research Project Progress Update',
                'report_type' => 'Progress Report',
                'subject_student' => 'AI Research Group',
                'content' => 'Progress report for the ongoing AI research project "Machine Learning Applications in Student Performance Prediction". Current phase involves data collection and preprocessing. Successfully gathered academic records from 500 students across 3 academic years. Data cleaning and feature engineering are 70% complete. Initial model training shows promising results with 82% accuracy in predicting student performance. Next phase will focus on model optimization and validation. Expected completion date: June 2026.',
                'status' => 'submitted',
            ],
            [
                'title' => 'Curriculum Review and Recommendations',
                'report_type' => 'Academic Report',
                'subject_student' => 'BSCS Program',
                'content' => 'Comprehensive review of the Bachelor of Science in Computer Science curriculum based on industry feedback and student performance analysis. Key findings: need to strengthen cybersecurity courses, update programming languages to include modern frameworks, and increase hands-on project requirements. Industry partners suggest adding courses on cloud computing, DevOps, and agile methodologies. Proposed changes would better align graduates with current market demands and improve employability rates.',
                'status' => 'draft',
            ],
            [
                'title' => 'Student Violation Documentation',
                'report_type' => 'Incident Report',
                'subject_student' => 'Maria Santos',
                'content' => 'Documentation of academic dishonesty incident involving student Maria Santos during the Database Systems midterm examination on March 20, 2026. Student was observed using unauthorized materials (cheat sheet) and attempting to communicate with another student. When confronted, student admitted to the violation. This is the first recorded incident for this student. Recommended sanctions include retaking the examination under supervision and mandatory attendance at academic integrity seminar.',
                'status' => 'submitted',
            ],
            [
                'title' => 'Faculty Development Workshop Summary',
                'report_type' => 'General Report',
                'subject_student' => 'CCS Faculty',
                'content' => 'Summary report of the Faculty Development Workshop on "Innovative Teaching Methods in Computer Science Education" held on March 10-12, 2026. Workshop covered topics including flipped classroom techniques, gamification in programming courses, and assessment strategies for practical skills. 12 faculty members participated with positive feedback scores averaging 4.5/5. Key takeaways include implementation of peer programming exercises and project-based learning approaches. Follow-up sessions scheduled for May 2026.',
                'status' => 'submitted',
            ],
            [
                'title' => 'Internship Program Evaluation',
                'report_type' => 'Progress Report',
                'subject_student' => 'OJT Students Batch 2026',
                'content' => 'Evaluation report for the On-the-Job Training program for Computer Science students. 25 students were deployed to various IT companies and government agencies. Performance feedback from industry partners indicates 88% satisfaction rate with student preparedness and technical skills. Areas for improvement include communication skills and project management capabilities. Recommendations include pre-OJT seminars on professional communication and basic project management principles.',
                'status' => 'draft',
            ],
            [
                'title' => 'Technology Infrastructure Assessment',
                'report_type' => 'General Report',
                'subject_student' => 'CCS Department',
                'content' => 'Annual assessment of technology infrastructure within the College of Computer Studies. Current setup includes 4 computer laboratories with 120 total workstations, 1 server room with 3 physical servers, and campus-wide WiFi coverage. Identified needs: upgrade to fiber internet connection, replacement of aging workstations (15 units over 5 years old), and implementation of cloud-based learning management system. Estimated budget requirement: PHP 2.5 million for complete infrastructure modernization.',
                'status' => 'submitted',
            ],
            [
                'title' => 'Student Organization Activity Report',
                'report_type' => 'General Report',
                'subject_student' => 'Computer Science Society',
                'content' => 'Activity report for the Computer Science Society for the first semester of AY 2025-2026. Successfully organized 5 major events including Programming Competition, Tech Talk Series, and Industry Night. Total participation reached 300+ students across all activities. Budget utilization: 95% of allocated funds used effectively. Challenges faced include venue scheduling conflicts and low attendance for technical workshops. Recommendations for next semester include better marketing strategies and collaboration with industry partners for more engaging content.',
                'status' => 'draft',
            ],
        ];

        foreach ($reportTemplates as $index => $template) {
            // Assign reports to different faculty members
            $faculty = $faculties->get($index % $faculties->count());
            
            // Check if report already exists to prevent duplicates
            $exists = Report::where('faculty_id', $faculty->id)
                ->where('title', $template['title'])
                ->exists();
                
            if ($exists) continue;
            
            Report::create([
                'faculty_id' => $faculty->id,
                'title' => $template['title'],
                'report_type' => $template['report_type'],
                'subject_student' => $template['subject_student'],
                'content' => $template['content'],
                'status' => $template['status'],
                'report_date' => now()->subDays(rand(1, 30))->toDateString(),
            ]);
        }

        $this->command->info('✓ Created 10 sample faculty reports');
    }
}