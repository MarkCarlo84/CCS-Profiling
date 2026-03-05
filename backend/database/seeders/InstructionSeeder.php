<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Curriculum;
use App\Models\Syllabus;
use App\Models\Lesson;
use App\Models\Course;
use App\Models\Department;
use App\Models\Faculty;

class InstructionSeeder extends Seeder
{
    public function run(): void
    {
        $depts = Department::pluck('id', 'code')->toArray();
        $faculties = Faculty::pluck('id')->toArray();

        // ── Courses ──────────────────────────────────────────────────────────
        $courseData = [
            ['code' => 'CS101',  'name' => 'Introduction to Computing',         'units' => 3, 'hours_per_week' => 3,  'type' => 'lecture'],
            ['code' => 'CS102',  'name' => 'Computer Programming I',             'units' => 3, 'hours_per_week' => 5,  'type' => 'both'],
            ['code' => 'CS201',  'name' => 'Data Structures and Algorithms',     'units' => 3, 'hours_per_week' => 3,  'type' => 'lecture'],
            ['code' => 'CS202',  'name' => 'Computer Programming II',            'units' => 3, 'hours_per_week' => 5,  'type' => 'both'],
            ['code' => 'CS301',  'name' => 'Database Management Systems',        'units' => 3, 'hours_per_week' => 5,  'type' => 'both'],
            ['code' => 'CS302',  'name' => 'Web Technologies',                   'units' => 3, 'hours_per_week' => 5,  'type' => 'both'],
            ['code' => 'CS401',  'name' => 'Software Engineering',               'units' => 3, 'hours_per_week' => 3,  'type' => 'lecture'],
            ['code' => 'CS402',  'name' => 'Systems Analysis and Design',        'units' => 3, 'hours_per_week' => 3,  'type' => 'lecture'],
            ['code' => 'IT101',  'name' => 'Information Technology Fundamentals','units' => 3, 'hours_per_week' => 3,  'type' => 'lecture'],
            ['code' => 'IT201',  'name' => 'Networking Essentials',              'units' => 3, 'hours_per_week' => 5,  'type' => 'both'],
            ['code' => 'IT301',  'name' => 'Network Administration',             'units' => 3, 'hours_per_week' => 5,  'type' => 'lab'],
            ['code' => 'IT401',  'name' => 'Cybersecurity Fundamentals',         'units' => 3, 'hours_per_week' => 3,  'type' => 'lecture'],
            ['code' => 'IS101',  'name' => 'Introduction to Information Systems','units' => 3, 'hours_per_week' => 3,  'type' => 'lecture'],
            ['code' => 'IS301',  'name' => 'Systems Integration and Architecture','units' => 3, 'hours_per_week' => 3, 'type' => 'lecture'],
            ['code' => 'MATH101','name' => 'Mathematics in the Modern World',    'units' => 3, 'hours_per_week' => 3,  'type' => 'lecture'],
        ];

        $deptId = array_values($depts)[0] ?? 1;
        foreach ($courseData as $cd) {
            Course::firstOrCreate(['code' => $cd['code']], array_merge($cd, [
                'department_id' => $deptId,
                'description'   => "This course covers topics in {$cd['name']}.",
                'is_active'     => true,
            ]));
        }

        // ── Curricula ─────────────────────────────────────────────────────────
        $curricula = [
            ['code' => 'BS-CS-2022', 'name' => 'BS Computer Science 2022 Curriculum',   'year_implemented' => 2022],
            ['code' => 'BS-IT-2022', 'name' => 'BS Information Technology 2022 Curriculum','year_implemented'=>2022],
            ['code' => 'BS-IS-2022', 'name' => 'BS Information Systems 2022 Curriculum',  'year_implemented'=>2022],
        ];

        foreach ($curricula as $c) {
            $curriculum = Curriculum::firstOrCreate(['code' => $c['code']], array_merge($c, [
                'department_id' => $deptId,
                'description'   => "{$c['name']} approved by CMO.",
                'status'        => 'active',
            ]));

            // Create syllabi for this curriculum
            $courses = Course::inRandomOrder()->take(3)->get();
            foreach ($courses as $course) {
                $syllabus = Syllabus::firstOrCreate(
                    ['curriculum_id' => $curriculum->id, 'course_id' => $course->id, 'semester' => '1st', 'school_year' => '2025-2026'],
                    [
                        'faculty_id'         => $faculties ? $faculties[array_rand($faculties)] : null,
                        'course_description' => "Detailed coverage of {$course->name}.",
                        'objectives'         => "Students will understand the fundamentals of {$course->name}.",
                        'references'         => "Textbook: Core Concepts in {$course->name}, 3rd Ed.",
                        'status'             => 'approved',
                    ]
                );

                // Create weekly lessons (18 weeks)
                for ($week = 1; $week <= 18; $week++) {
                    Lesson::firstOrCreate(
                        ['syllabus_id' => $syllabus->id, 'week_number' => $week],
                        [
                            'topic'               => "Week {$week}: " . $this->topicForWeek($week, $course->name),
                            'learning_objectives' => "Students will be able to explain and apply Week {$week} concepts.",
                            'materials'           => 'Slides, textbook chapters, online references',
                            'activities'          => $week % 4 === 0 ? 'Quiz / Seatwork' : 'Lecture + Discussion',
                            'assessment'          => $week === 9 ? 'Midterm Exam' : ($week === 18 ? 'Final Exam' : 'Formative Assessment'),
                        ]
                    );
                }
            }
        }
    }

    private function topicForWeek(int $week, string $courseName): string
    {
        $topics = [
            1  => 'Course Orientation and Overview',
            2  => 'Fundamental Concepts and Theories',
            3  => 'Core Principles and Methods',
            4  => 'First Seatwork / Review',
            5  => 'Intermediate Topics I',
            6  => 'Intermediate Topics II',
            7  => 'Case Studies and Applications',
            8  => 'Pre-Midterm Review',
            9  => 'Midterm Examination',
            10 => 'Midterm Feedback and Advanced Overview',
            11 => 'Advanced Topics I',
            12 => 'Advanced Topics II',
            13 => 'Project Workshop I',
            14 => 'Project Workshop II',
            15 => 'Current Trends and Industry Perspectives',
            16 => 'Emerging Technologies',
            17 => 'Pre-Final Review',
            18 => 'Final Examination',
        ];
        return ($topics[$week] ?? "Special Topic") . " — {$courseName}";
    }
}
