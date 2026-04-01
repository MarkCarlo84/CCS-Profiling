<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            // ─── BSCS - Year 1 ───────────────────────────────────────────
            ['subject_code' => 'CS101',  'subject_name' => 'Introduction to Computing',          'units' => 3, 'year_level' => '1st Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => null],
            ['subject_code' => 'CS102',  'subject_name' => 'Computer Programming 1',             'units' => 3, 'year_level' => '1st Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => null],
            ['subject_code' => 'MATH101','subject_name' => 'Mathematics in the Modern World',    'units' => 3, 'year_level' => '1st Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => null],
            ['subject_code' => 'GE101',  'subject_name' => 'Understanding the Self',             'units' => 3, 'year_level' => '1st Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => null],
            ['subject_code' => 'GE102',  'subject_name' => 'Purposive Communication',           'units' => 3, 'year_level' => '1st Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => null],

            ['subject_code' => 'CS103',  'subject_name' => 'Computer Programming 2',            'units' => 3, 'year_level' => '1st Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS102'],
            ['subject_code' => 'CS104',  'subject_name' => 'Digital Logic Design',              'units' => 3, 'year_level' => '1st Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => null],
            ['subject_code' => 'MATH102','subject_name' => 'Calculus 1',                        'units' => 3, 'year_level' => '1st Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => null],
            ['subject_code' => 'GE103',  'subject_name' => 'Readings in Philippine History',    'units' => 3, 'year_level' => '1st Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => null],
            ['subject_code' => 'GE104',  'subject_name' => 'The Contemporary World',            'units' => 3, 'year_level' => '1st Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => null],

            // ─── BSCS - Year 2 ───────────────────────────────────────────
            ['subject_code' => 'CS201',  'subject_name' => 'Data Structures and Algorithms',    'units' => 3, 'year_level' => '2nd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS103'],
            ['subject_code' => 'CS202',  'subject_name' => 'Object-Oriented Programming',       'units' => 3, 'year_level' => '2nd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS103'],
            ['subject_code' => 'CS203',  'subject_name' => 'Discrete Mathematics',              'units' => 3, 'year_level' => '2nd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'MATH102'],
            ['subject_code' => 'CS204',  'subject_name' => 'Computer Organization and Architecture', 'units' => 3, 'year_level' => '2nd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS104'],
            ['subject_code' => 'MATH201','subject_name' => 'Calculus 2',                        'units' => 3, 'year_level' => '2nd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'MATH102'],

            ['subject_code' => 'CS205',  'subject_name' => 'Database Management Systems',       'units' => 3, 'year_level' => '2nd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS201'],
            ['subject_code' => 'CS206',  'subject_name' => 'Operating Systems',                 'units' => 3, 'year_level' => '2nd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS204'],
            ['subject_code' => 'CS207',  'subject_name' => 'Web Development 1',                 'units' => 3, 'year_level' => '2nd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS202'],
            ['subject_code' => 'CS208',  'subject_name' => 'Probability and Statistics',        'units' => 3, 'year_level' => '2nd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'MATH201'],
            ['subject_code' => 'GE201',  'subject_name' => 'Ethics',                            'units' => 3, 'year_level' => '2nd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => null],

            // ─── BSCS - Year 3 ───────────────────────────────────────────
            ['subject_code' => 'CS301',  'subject_name' => 'Software Engineering 1',            'units' => 3, 'year_level' => '3rd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS205'],
            ['subject_code' => 'CS302',  'subject_name' => 'Computer Networks',                 'units' => 3, 'year_level' => '3rd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS206'],
            ['subject_code' => 'CS303',  'subject_name' => 'Algorithm Design and Analysis',     'units' => 3, 'year_level' => '3rd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS201'],
            ['subject_code' => 'CS304',  'subject_name' => 'Web Development 2',                 'units' => 3, 'year_level' => '3rd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS207'],
            ['subject_code' => 'CS305',  'subject_name' => 'Human-Computer Interaction',        'units' => 3, 'year_level' => '3rd Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => null],

            ['subject_code' => 'CS306',  'subject_name' => 'Software Engineering 2',            'units' => 3, 'year_level' => '3rd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS301'],
            ['subject_code' => 'CS307',  'subject_name' => 'Artificial Intelligence',           'units' => 3, 'year_level' => '3rd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS303'],
            ['subject_code' => 'CS308',  'subject_name' => 'Information Security',              'units' => 3, 'year_level' => '3rd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS302'],
            ['subject_code' => 'CS309',  'subject_name' => 'Mobile Application Development',   'units' => 3, 'year_level' => '3rd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS304'],
            ['subject_code' => 'CS310',  'subject_name' => 'Research Methods in Computing',     'units' => 3, 'year_level' => '3rd Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => null],

            // ─── BSCS - Year 4 ───────────────────────────────────────────
            ['subject_code' => 'CS401',  'subject_name' => 'Capstone Project 1',                'units' => 3, 'year_level' => '4th Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS310'],
            ['subject_code' => 'CS402',  'subject_name' => 'Machine Learning',                  'units' => 3, 'year_level' => '4th Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS307'],
            ['subject_code' => 'CS403',  'subject_name' => 'Cloud Computing',                   'units' => 3, 'year_level' => '4th Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS302'],
            ['subject_code' => 'CS404',  'subject_name' => 'Software Project Management',       'units' => 3, 'year_level' => '4th Year', 'semester' => '1st Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS306'],

            ['subject_code' => 'CS405',  'subject_name' => 'Capstone Project 2',                'units' => 3, 'year_level' => '4th Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS401'],
            ['subject_code' => 'CS406',  'subject_name' => 'Practicum / On-the-Job Training',   'units' => 6, 'year_level' => '4th Year', 'semester' => '2nd Semester', 'program' => 'BSCS', 'pre_requisite' => 'CS401'],

            // ─── BSIT - Year 1 ───────────────────────────────────────────
            ['subject_code' => 'IT101',  'subject_name' => 'Introduction to Information Technology', 'units' => 3, 'year_level' => '1st Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => null],
            ['subject_code' => 'IT102',  'subject_name' => 'Computer Programming 1',             'units' => 3, 'year_level' => '1st Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => null],
            ['subject_code' => 'IT103',  'subject_name' => 'Computer Hardware Fundamentals',    'units' => 3, 'year_level' => '1st Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => null],

            ['subject_code' => 'IT104',  'subject_name' => 'Computer Programming 2',            'units' => 3, 'year_level' => '1st Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT102'],
            ['subject_code' => 'IT105',  'subject_name' => 'Web Design and Development',        'units' => 3, 'year_level' => '1st Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => null],
            ['subject_code' => 'IT106',  'subject_name' => 'Networking Fundamentals',           'units' => 3, 'year_level' => '1st Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => null],

            // ─── BSIT - Year 2 ───────────────────────────────────────────
            ['subject_code' => 'IT201',  'subject_name' => 'Data Structures',                   'units' => 3, 'year_level' => '2nd Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT104'],
            ['subject_code' => 'IT202',  'subject_name' => 'Database Systems',                  'units' => 3, 'year_level' => '2nd Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT104'],
            ['subject_code' => 'IT203',  'subject_name' => 'Systems Analysis and Design',       'units' => 3, 'year_level' => '2nd Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => null],

            ['subject_code' => 'IT204',  'subject_name' => 'Network Administration',            'units' => 3, 'year_level' => '2nd Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT106'],
            ['subject_code' => 'IT205',  'subject_name' => 'Object-Oriented Programming',       'units' => 3, 'year_level' => '2nd Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT201'],
            ['subject_code' => 'IT206',  'subject_name' => 'Web Systems and Technologies',      'units' => 3, 'year_level' => '2nd Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT105'],

            // ─── BSIT - Year 3 ───────────────────────────────────────────
            ['subject_code' => 'IT301',  'subject_name' => 'Application Development',           'units' => 3, 'year_level' => '3rd Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT205'],
            ['subject_code' => 'IT302',  'subject_name' => 'Information Assurance and Security','units' => 3, 'year_level' => '3rd Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT204'],
            ['subject_code' => 'IT303',  'subject_name' => 'Integrative Programming',           'units' => 3, 'year_level' => '3rd Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT205'],

            ['subject_code' => 'IT304',  'subject_name' => 'IT Project Management',             'units' => 3, 'year_level' => '3rd Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => null],
            ['subject_code' => 'IT305',  'subject_name' => 'Mobile Development',                'units' => 3, 'year_level' => '3rd Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT301'],
            ['subject_code' => 'IT306',  'subject_name' => 'Technopreneurship',                 'units' => 3, 'year_level' => '3rd Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => null],

            // ─── BSIT - Year 4 ───────────────────────────────────────────
            ['subject_code' => 'IT401',  'subject_name' => 'Capstone Project 1',                'units' => 3, 'year_level' => '4th Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT304'],
            ['subject_code' => 'IT402',  'subject_name' => 'System Integration and Architecture','units' => 3, 'year_level' => '4th Year', 'semester' => '1st Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT303'],

            ['subject_code' => 'IT403',  'subject_name' => 'Capstone Project 2',                'units' => 3, 'year_level' => '4th Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT401'],
            ['subject_code' => 'IT404',  'subject_name' => 'Practicum / On-the-Job Training',   'units' => 6, 'year_level' => '4th Year', 'semester' => '2nd Semester', 'program' => 'BSIT', 'pre_requisite' => 'IT401'],
        ];

        foreach ($subjects as $subject) {
            Subject::firstOrCreate(
                ['subject_code' => $subject['subject_code']],
                $subject
            );
        }

        $this->command->info('✓ Subjects seeded (' . count($subjects) . ' subjects for BSCS and BSIT)');
    }
}
