<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Faculty;
use App\Models\Student;
use App\Models\Affiliation;
use App\Models\Skill;
use App\Models\NonAcademicHistory;
use App\Models\Violation;
use App\Models\AcademicRecord;
use App\Models\Grade;
use App\Models\Event;
use App\Models\EventParticipant;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedFaculty();
        $this->seedStudents();
        $this->seedEvents();
        $this->command->info('✓ DemoSeeder complete');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FACULTY  (7 IT + 8 CS = 15 teachers)
    // ─────────────────────────────────────────────────────────────────────────
    private function seedFaculty(): void
    {
        $teachers = [
            // IT faculty (7)
            ['FAC-IT-001','Maria','Santos','Cruz',   'IT','Instructor I',  'maria.santos@ccs.edu.ph',   '09171234501'],
            ['FAC-IT-002','Jose', 'Reyes', 'Bautista','IT','Instructor II', 'jose.reyes@ccs.edu.ph',     '09171234502'],
            ['FAC-IT-003','Ana',  'Garcia','Dela Cruz','IT','Assistant Professor','ana.garcia@ccs.edu.ph','09171234503'],
            ['FAC-IT-004','Carlo','Mendoza','Lim',   'IT','Instructor I',  'carlo.mendoza@ccs.edu.ph',  '09171234504'],
            ['FAC-IT-005','Liza', 'Torres', 'Ramos', 'IT','Instructor II', 'liza.torres@ccs.edu.ph',    '09171234505'],
            ['FAC-IT-006','Ramon','Villanueva','Tan', 'IT','Associate Professor','ramon.villanueva@ccs.edu.ph','09171234506'],
            ['FAC-IT-007','Grace','Aquino', 'Flores','IT','Instructor I',  'grace.aquino@ccs.edu.ph',   '09171234507'],
            // CS faculty (8)
            ['FAC-CS-001','Miguel','Castillo','Navarro','CS','Assistant Professor','miguel.castillo@ccs.edu.ph','09181234501'],
            ['FAC-CS-002','Rosa',  'Fernandez','Gomez','CS','Instructor II',    'rosa.fernandez@ccs.edu.ph', '09181234502'],
            ['FAC-CS-003','Dante', 'Morales',  'Perez','CS','Associate Professor','dante.morales@ccs.edu.ph','09181234503'],
            ['FAC-CS-004','Celia', 'Pascual',  'Diaz', 'CS','Instructor I',    'celia.pascual@ccs.edu.ph',  '09181234504'],
            ['FAC-CS-005','Ernesto','Salazar', 'Ruiz', 'CS','Instructor II',   'ernesto.salazar@ccs.edu.ph','09181234505'],
            ['FAC-CS-006','Nora',  'Jimenez',  'Vega', 'CS','Assistant Professor','nora.jimenez@ccs.edu.ph','09181234506'],
            ['FAC-CS-007','Felix', 'Herrera',  'Abad', 'CS','Instructor I',    'felix.herrera@ccs.edu.ph',  '09181234507'],
            ['FAC-CS-008','Teresita','Ocampo', 'Luna', 'CS','Associate Professor','teresita.ocampo@ccs.edu.ph','09181234508'],
        ];

        // IT subjects to assign
        $itSubjects = DB::table('subjects')
            ->where('program', 'Information Technology')
            ->pluck('id')->toArray();

        // CS subjects to assign
        $csSubjects = DB::table('subjects')
            ->where('program', 'Computer Science')
            ->pluck('id')->toArray();

        foreach ($teachers as $t) {
            [$fid, $fn, $ln, $mn, $dept, $pos, $email, $phone] = $t;

            $faculty = Faculty::firstOrCreate(['faculty_id' => $fid], [
                'first_name'     => $fn,
                'last_name'      => $ln,
                'middle_name'    => $mn,
                'department'     => $dept,
                'position'       => $pos,
                'email'          => $email,
                'contact_number' => $phone,
            ]);

            User::firstOrCreate(['email' => $email], [
                'name'       => "$fn $ln",
                'password'   => Hash::make('Teacher1234'),
                'role'       => 'teacher',
                'faculty_id' => $faculty->id,
            ]);

            // Assign 3–5 subjects per teacher
            $pool = str_starts_with($fid, 'FAC-IT') ? $itSubjects : $csSubjects;
            $assigned = collect($pool)->shuffle()->take(rand(3, 5));
            foreach ($assigned as $subjectId) {
                DB::table('faculty_subjects')->updateOrInsert(
                    ['faculty_id' => $faculty->id, 'subject_id' => $subjectId, 'school_year' => '2025-2026', 'semester' => '2nd'],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }

        $this->command->info('✓ 15 faculty seeded (7 IT, 8 CS) with subject assignments');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENTS  (22 IT + 18 CS = 40 students)
    // ─────────────────────────────────────────────────────────────────────────
    private function seedStudents(): void
    {
        // Student ID format: YY + 5-digit sequence
        // YY = last 2 digits of enrollment year (year level 4 → enrolled 2022 → "22", etc.)
        // e.g. 4th Year → 2200001, 3rd Year → 2300001, 2nd Year → 2400001, 1st Year → 2500001
        $students = [
            // ── IT Students (22) ──────────────────────────────────────────────
            // 1st Year (enrolled 2025 → prefix 25)
            ['2500101','IT','Juan',    'Dela','Cruz',     19,'Male',  '1st Year','2025-01-10','active','Quezon City'],
            ['2500102','IT','Patricia','Mae', 'Reyes',    18,'Female','1st Year','2025-01-10','active','Caloocan'],
            ['2500103','IT','Marco',   'Luis','Bautista', 19,'Male',  '1st Year','2025-01-10','active','Marikina'],
            ['2500104','IT','Sheila',  'Ann', 'Gomez',    18,'Female','1st Year','2025-01-10','active','Pasig'],
            ['2500105','IT','Renz',    'Karl','Villanueva',19,'Male', '1st Year','2025-01-10','active','Mandaluyong'],
            // 2nd Year (enrolled 2024 → prefix 24)
            ['2400101','IT','Kristine','Joy', 'Santos',   20,'Female','2nd Year','2024-06-10','active','Taguig'],
            ['2400102','IT','Aldrin',  'Paul','Mendoza',  20,'Male',  '2nd Year','2024-06-10','active','Paranaque'],
            ['2400103','IT','Camille', 'Rose','Aquino',   19,'Female','2nd Year','2024-06-10','active','Las Pinas'],
            ['2400104','IT','Jericho', 'Noel','Flores',   20,'Male',  '2nd Year','2024-06-10','active','Muntinlupa'],
            ['2400105','IT','Maricel', 'Ann', 'Torres',   20,'Female','2nd Year','2024-06-10','active','Valenzuela'],
            // 3rd Year (enrolled 2023 → prefix 23)
            ['2300101','IT','Ronaldo', 'Jose','Pascual',  21,'Male',  '3rd Year','2023-06-10','active','Malabon'],
            ['2300102','IT','Jasmine', 'Luz', 'Navarro',  21,'Female','3rd Year','2023-06-10','active','Navotas'],
            ['2300103','IT','Arvin',   'Rey', 'Castillo', 22,'Male',  '3rd Year','2023-06-10','active','San Juan'],
            ['2300104','IT','Lovely',  'Mae', 'Morales',  21,'Female','3rd Year','2023-06-10','active','Mandaluyong'],
            ['2300105','IT','Dennis',  'Cruz','Salazar',  22,'Male',  '3rd Year','2023-06-10','active','Quezon City'],
            ['2300106','IT','Rhea',    'Joy', 'Jimenez',  21,'Female','3rd Year','2023-06-10','active','Caloocan'],
            // 4th Year (enrolled 2022 → prefix 22)
            ['2200101','IT','Marvin',  'Ace', 'Herrera',  23,'Male',  '4th Year','2022-06-10','active','Marikina'],
            ['2200102','IT','Joanna',  'Faye','Ocampo',   22,'Female','4th Year','2022-06-10','active','Pasig'],
            ['2200103','IT','Elmer',   'Dan', 'Perez',    23,'Male',  '4th Year','2022-06-10','active','Taguig'],
            ['2200104','IT','Vanessa', 'Lyn', 'Ruiz',     22,'Female','4th Year','2022-06-10','active','Paranaque'],
            ['2200105','IT','Noel',    'Gio', 'Vega',     23,'Male',  '4th Year','2022-06-10','active','Las Pinas'],
            ['2200106','IT','Abigail', 'Rae', 'Abad',     22,'Female','4th Year','2022-06-10','active','Muntinlupa'],
            // ── CS Students (18) ──────────────────────────────────────────────
            // 1st Year (enrolled 2025 → prefix 25)
            ['2500201','CS','Lester',  'John','Diaz',     18,'Male',  '1st Year','2025-01-10','active','Quezon City'],
            ['2500202','CS','Angelica','Mae', 'Luna',     18,'Female','1st Year','2025-01-10','active','Caloocan'],
            ['2500203','CS','Cyrus',   'Lee', 'Tan',      19,'Male',  '1st Year','2025-01-10','active','Marikina'],
            ['2500204','CS','Hazel',   'Ann', 'Lim',      18,'Female','1st Year','2025-01-10','active','Pasig'],
            // 2nd Year (enrolled 2024 → prefix 24)
            ['2400201','CS','Jomar',   'Rex', 'Ramos',    20,'Male',  '2nd Year','2024-06-10','active','Mandaluyong'],
            ['2400202','CS','Tricia',  'Lyn', 'Dela Cruz',19,'Female','2nd Year','2024-06-10','active','Taguig'],
            ['2400203','CS','Aldous',  'Kai', 'Bautista', 20,'Male',  '2nd Year','2024-06-10','active','Paranaque'],
            ['2400204','CS','Mylene',  'Joy', 'Garcia',   19,'Female','2nd Year','2024-06-10','active','Las Pinas'],
            ['2400205','CS','Rodel',   'Mar', 'Reyes',    20,'Male',  '2nd Year','2024-06-10','active','Muntinlupa'],
            // 3rd Year (enrolled 2023 → prefix 23)
            ['2300201','CS','Sheena',  'Rae', 'Santos',   21,'Female','3rd Year','2023-06-10','active','Valenzuela'],
            ['2300202','CS','Gino',    'Paul','Mendoza',  22,'Male',  '3rd Year','2023-06-10','active','Malabon'],
            ['2300203','CS','Kristel', 'Ann', 'Aquino',   21,'Female','3rd Year','2023-06-10','active','Navotas'],
            ['2300204','CS','Nico',    'Jay', 'Flores',   22,'Male',  '3rd Year','2023-06-10','active','San Juan'],
            ['2300205','CS','Pamela',  'Rose','Torres',   21,'Female','3rd Year','2023-06-10','active','Mandaluyong'],
            // 4th Year (enrolled 2022 → prefix 22)
            ['2200201','CS','Renato',  'Ace', 'Pascual',  23,'Male',  '4th Year','2022-06-10','active','Quezon City'],
            ['2200202','CS','Lorraine','Faye','Navarro',  22,'Female','4th Year','2022-06-10','active','Caloocan'],
            ['2200203','CS','Aldrin',  'Dan', 'Castillo', 23,'Male',  '4th Year','2022-06-10','active','Marikina'],
            ['2200204','CS','Maribel', 'Luz', 'Morales',  22,'Female','4th Year','2022-06-10','active','Pasig'],
        ];

        $yearMap = [
            '1st Year' => 1,
            '2nd Year' => 2,
            '3rd Year' => 3,
            '4th Year' => 4,
        ];

        // School years per year level
        $syMap = [
            '1st Year' => '2025-2026',
            '2nd Year' => '2024-2025',
            '3rd Year' => '2023-2024',
            '4th Year' => '2022-2023',
        ];

        foreach ($students as $s) {
            [$sid, $dept, $fn, $mn, $ln, $age, $gender, $yearLevel, $enrollDate, $status, $address] = $s;

            $student = Student::firstOrCreate(['student_id' => $sid], [
                'department'     => $dept, // 'IT' or 'CS' — matches frontend grouping keys
                'first_name'     => $fn,
                'middle_name'    => $mn,
                'last_name'      => $ln,
                'age'            => $age,
                'gender'         => $gender,
                'address'        => $address . ', Metro Manila',
                'contact_number' => '0917' . rand(1000000, 9999999),
                'email'          => strtolower($fn . '.' . $ln . rand(10,99) . '@student.ccs.edu.ph'),
                'enrollment_date'=> $enrollDate,
                'status'         => $status,
                'date_of_birth'  => now()->subYears($age)->subDays(rand(0, 364))->format('Y-m-d'),
                'guardian_name'  => 'Parent of ' . $fn . ' ' . $ln,
            ]);

            User::firstOrCreate(['email' => $student->email], [
                'name'       => "$fn $ln",
                'password'   => Hash::make('Student1234'),
                'role'       => 'student',
                'student_id' => $student->id,
            ]);

            $this->seedStudentProfile($student, $dept, $yearLevel, $yearMap[$yearLevel], $syMap[$yearLevel]);
        }

        $this->command->info('✓ 40 students seeded (22 IT, 18 CS) with full profiles');
    }

    private function seedStudentProfile(Student $student, string $dept, string $yearLevel, int $yearNum, string $sy): void
    {
        $this->seedAffiliations($student, $dept);
        $this->seedSkills($student, $dept);
        $this->seedNonAcademicHistory($student, $dept);
        $this->seedAcademicRecords($student, $dept, $yearNum, $sy);

        // ~40% of students get violations
        if (rand(1, 10) <= 4) {
            $this->seedViolations($student);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AFFILIATIONS
    // ─────────────────────────────────────────────────────────────────────────
    private function seedAffiliations(Student $student, string $dept): void
    {
        $pool = [
            // Academic orgs
            ['CCS Student Council',         'Academic',    ['President','Vice President','Secretary','Treasurer','Member']],
            ['Google Developer Student Club','Academic',    ['Lead','Core Member','Member']],
            ['AWS Cloud Club',               'Academic',    ['President','Member','Cloud Advocate']],
            ['ACM Student Chapter',          'Academic',    ['Chair','Vice Chair','Member']],
            ['Junior Philippine Computer Society','Academic',['President','Secretary','Member']],
            // Civic / community
            ['Red Cross Youth',              'Civic',       ['Volunteer','Chapter Head','Member']],
            ['Rotaract Club',                'Civic',       ['President','Secretary','Member']],
            ['Youth for Environment',        'Civic',       ['Coordinator','Member']],
            // Sports
            ['University Basketball Team',   'Sports',      ['Captain','Player','Bench Player']],
            ['Volleyball Club',              'Sports',      ['Captain','Setter','Libero','Player']],
            ['Chess Club',                   'Sports',      ['President','Member','Varsity Player']],
            ['Badminton Club',               'Sports',      ['Captain','Member']],
            // Arts & Culture
            ['CCS Dance Troupe',             'Cultural',    ['Lead Dancer','Member','Choreographer']],
            ['University Chorale',           'Cultural',    ['Section Leader','Member']],
            ['Photography Club',             'Cultural',    ['President','Photographer','Member']],
            // IT/CS specific
            ['Cybersecurity Club',           'Technical',   ['President','Member','Ethical Hacker']],
            ['Game Development Society',     'Technical',   ['Lead Developer','Member','Artist']],
            ['Open Source Advocates',        'Technical',   ['Maintainer','Contributor','Member']],
        ];

        // Each student gets 1–3 affiliations
        $picks = collect($pool)->shuffle()->take(rand(1, 3));
        foreach ($picks as [$name, $type, $roles]) {
            Affiliation::create([
                'student_id'  => $student->id,
                'name'        => $name,
                'type'        => $type,
                'role'        => $roles[array_rand($roles)],
                'date_joined' => now()->subMonths(rand(3, 36))->format('Y-m-d'),
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SKILLS
    // ─────────────────────────────────────────────────────────────────────────
    private function seedSkills(Student $student, string $dept): void
    {
        $itSkills = [
            ['PHP Laravel','intermediate',true], ['JavaScript','intermediate',false],
            ['React.js','beginner',false],       ['MySQL','intermediate',true],
            ['Python','beginner',false],         ['HTML/CSS','advanced',false],
            ['Node.js','beginner',false],        ['Git & GitHub','intermediate',true],
            ['REST API Development','intermediate',false], ['Docker','beginner',false],
            ['Linux Administration','beginner',false],     ['Network Troubleshooting','intermediate',true],
            ['Figma / UI Design','beginner',false],        ['WordPress','intermediate',false],
        ];

        $csSkills = [
            ['C++ Programming','advanced',true],   ['Java','intermediate',true],
            ['Python','advanced',true],            ['Data Structures','advanced',false],
            ['Algorithm Design','intermediate',false], ['Machine Learning','beginner',false],
            ['Unity Game Engine','intermediate',true], ['OpenGL','beginner',false],
            ['Discrete Mathematics','intermediate',false], ['Operating Systems','intermediate',false],
            ['Compiler Design','beginner',false],  ['Computer Graphics','beginner',false],
            ['Artificial Intelligence','intermediate',true], ['Git & GitHub','intermediate',false],
        ];

        $pool = $dept === 'IT' ? $itSkills : $csSkills;
        $picks = collect($pool)->shuffle()->take(rand(2, 4));

        foreach ($picks as [$name, $level, $cert]) {
            Skill::create([
                'student_id'    => $student->id,
                'skill_name'    => $name,
                'skill_level'   => $level,
                'certification' => $cert,
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NON-ACADEMIC HISTORY
    // ─────────────────────────────────────────────────────────────────────────
    private function seedNonAcademicHistory(Student $student, string $dept): void
    {
        $activities = [
            ['Intramural Basketball Tournament','Sports','Competed in the annual university intramural games','Player','CCS Sports Committee','Win'],
            ['Hackathon 2024','Competition','24-hour coding competition focused on social impact solutions','Participant','DICT Philippines','2nd Place'],
            ['CCS Foundation Week','Cultural','Annual week-long celebration of the college with various activities','Performer','CCS Student Council',null],
            ['Regional IT Quiz Bee','Competition','Regional-level quiz competition covering IT fundamentals','Contestant','DepEd Region IV',null],
            ['Community Tech Literacy Drive','Community Service','Taught basic computer skills to senior citizens in Barangay 123','Volunteer','Rotaract Club',null],
            ['National Coding Competition','Competition','Competed in a national-level programming contest','Contestant','PSITE National','3rd Place'],
            ['University Sportsfest Volleyball','Sports','Participated in the university-wide volleyball tournament','Player','University Athletics Office','Runner-up'],
            ['Tech Talk: AI in Education','Seminar','Attended a seminar on the applications of AI in modern education','Attendee','Google Philippines',null],
            ['Campus Photography Exhibit','Cultural','Showcased original photography work in the annual campus exhibit','Exhibitor','Photography Club',null],
            ['Blood Donation Drive','Community Service','Participated in the quarterly blood donation drive on campus','Donor','Philippine Red Cross',null],
            ['Esports Tournament (Mobile Legends)','Sports','Competed in the university esports tournament','Team Captain','CCS Esports Club','Champion'],
            ['Web Design Competition','Competition','Designed and developed a website for a given brief within 8 hours','Developer','CHED Region IV','1st Place'],
            ['Environmental Clean-Up Drive','Community Service','Joined the coastal clean-up activity at Manila Bay','Volunteer','Youth for Environment',null],
            ['Leadership Summit','Seminar','Attended a two-day leadership development summit for student leaders','Delegate','CHED',null],
            ['Dance Competition (Street Dance)','Cultural','Performed in the inter-college street dance competition','Dancer','CCS Dance Troupe','2nd Place'],
        ];

        $picks = collect($activities)->shuffle()->take(rand(1, 3));
        foreach ($picks as $a) {
            [$title, $cat, $desc, $role, $org, $result] = $a;
            $start = now()->subMonths(rand(6, 30));
            NonAcademicHistory::create([
                'student_id'    => $student->id,
                'activity_title'=> $title,
                'category'      => $cat,
                'description'   => $desc,
                'date_started'  => $start->format('Y-m-d'),
                'date_ended'    => $start->addDays(rand(1, 5))->format('Y-m-d'),
                'role'          => $role,
                'organizer'     => $org,
                'game_result'   => $result,
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACADEMIC RECORDS + GRADES
    // ─────────────────────────────────────────────────────────────────────────
    private function seedAcademicRecords(Student $student, string $dept, int $yearNum, string $sy): void
    {
            $program = $dept === 'IT' ? 'Information Technology' : 'Computer Science';
        $grades  = [1.00, 1.25, 1.50, 2.00, 2.25, 2.50, 3.00];

        // Seed records for all completed semesters up to current year
        for ($y = 1; $y <= $yearNum; $y++) {
            $sems = ($y === $yearNum) ? ['1st'] : ['1st', '2nd'];
            foreach ($sems as $sem) {
                $schoolYear = match ($y) {
                    1 => '2025-2026',
                    2 => '2024-2025',
                    3 => '2023-2024',
                    4 => '2022-2023',
                };

                $record = AcademicRecord::create([
                    'student_id' => $student->id,
                    'school_year'=> $schoolYear,
                    'semester'   => $sem,
                    'year_level' => $y,
                    'gpa'        => null,
                ]);

                // Get subjects for this year/semester/program
                $subjects = DB::table('subjects')
                    ->where('program', $program)
                    ->where('year_level', $y . ($y === 1 ? 'st' : ($y === 2 ? 'nd' : ($y === 3 ? 'rd' : 'th'))) . ' Year')
                    ->where('semester', $sem . ($sem === '1st' ? 'st' : 'nd') . ' Semester')
                    ->get();

                // Fallback: just grab any subjects for that program if naming doesn't match
                if ($subjects->isEmpty()) {
                    $yearLabel = match ($y) { 1 => '1st Year', 2 => '2nd Year', 3 => '3rd Year', 4 => '4th Year' };
                    $semLabel  = $sem === '1st' ? '1st Semester' : '2nd Semester';
                    $subjects  = DB::table('subjects')
                        ->where('program', $program)
                        ->where('year_level', $yearLabel)
                        ->where('semester', $semLabel)
                        ->get();
                }

                foreach ($subjects as $sub) {
                    $score = $grades[array_rand($grades)];
                    Grade::create([
                        'academic_record_id' => $record->id,
                        'subject_id'         => $sub->id,
                        'subject_name'       => $sub->subject_name,
                        'score'              => $score,
                        'remarks'            => $score <= 3.00 ? 'Passed' : 'Failed',
                    ]);
                }

                $record->calculateGPA();
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VIOLATIONS
    // ─────────────────────────────────────────────────────────────────────────
    private function seedViolations(Student $student): void
    {
        $violations = [
            ['Tardiness',          'Arrived more than 30 minutes late to class without valid excuse.',                'minor',  'Verbal warning issued by the instructor.'],
            ['Cheating',           'Caught copying answers from a classmate during a major examination.',             'major',  'Given a grade of 0 for the exam; parents notified.'],
            ['Dress Code Violation','Wore non-prescribed attire inside the campus premises.',                         'minor',  'Sent home to change; written warning issued.'],
            ['Disruptive Behavior','Repeatedly disrupted class by using a mobile phone during lecture.',              'minor',  'Phone confiscated; returned after class.'],
            ['Plagiarism',         'Submitted a research paper with significant portions copied from online sources.','major',  'Required to resubmit; grade deducted by 30%.'],
            ['Vandalism',          'Found writing on school property (laboratory desk).',                             'major',  'Required to pay for damages; community service assigned.'],
            ['Unauthorized Absence','Accumulated 5 consecutive absences without prior notice.',                       'minor',  'Counseling session scheduled with the guidance office.'],
            ['Bullying',           'Reported for repeatedly mocking a classmate in the group chat.',                  'major',  'Suspended for 3 days; parents called for conference.'],
            ['Smoking on Campus',  'Caught smoking inside the campus building.',                                      'major',  'Written reprimand; referred to guidance counselor.'],
            ['Insubordination',    'Refused to follow instructions from a faculty member during laboratory class.',   'minor',  'Verbal warning; incident logged in student record.'],
        ];

        $count = rand(1, 2);
        $picks = collect($violations)->shuffle()->take($count);

        foreach ($picks as [$type, $desc, $severity, $action]) {
            $committed = now()->subMonths(rand(1, 18));
            $resolved  = $severity === 'minor' && rand(0, 1);
            Violation::create([
                'student_id'     => $student->id,
                'violation_type' => $type,
                'description'    => $desc,
                'date_committed' => $committed->format('Y-m-d'),
                'severity_level' => $severity,
                'action_taken'   => $action,
                'is_resolved'    => (bool) $resolved,
                'resolved_at'    => $resolved ? $committed->addDays(rand(3, 14))->toDateTimeString() : null,
            ]);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTS  (admin-created, mixed IT & CS)
    // ─────────────────────────────────────────────────────────────────────────
    private function seedEvents(): void
    {
        $itDept = DB::table('departments')->where('code', 'IT')->orWhere('name', 'like', '%Information Technology%')->first();
        $csDept = DB::table('departments')->where('code', 'CS')->orWhere('name', 'like', '%Computer Science%')->first();
        $itId   = $itDept?->id ?? null;
        $csId   = $csDept?->id ?? null;

        $events = [
            // Upcoming
            ['CCS Intramural Games 2026',           'extra_curricular','Sports',       'CCS Admin',         'University Gymnasium',         '2026-05-10','2026-05-12','Annual intramural sports competition for all CCS students.',                    'upcoming', null,  200],
            ['Hackathon: Code for Change 2026',     'curricular',      'Competition',  'CCS Admin',         'CCS Computer Laboratory',      '2026-05-20','2026-05-21','24-hour hackathon challenging students to build solutions for social problems.', 'upcoming', $itId, 80],
            ['AI & Machine Learning Summit',        'curricular',      'Seminar',      'CCS Admin',         'CCS Auditorium',               '2026-06-05','2026-06-05','Industry speakers discuss the latest trends in AI and ML.',                     'upcoming', $csId, 150],
            ['Web Dev Workshop: React & Laravel',   'curricular',      'Workshop',     'CCS Admin',         'CCS Lab 3',                    '2026-06-15','2026-06-16','Hands-on workshop on building full-stack web applications.',                    'upcoming', $itId, 40],
            ['CCS Foundation Week 2026',            'extra_curricular','Cultural',     'CCS Admin',         'CCS Campus Grounds',           '2026-07-01','2026-07-05','Week-long celebration featuring cultural shows, competitions, and exhibits.',    'upcoming', null,  500],
            // Ongoing
            ['Capstone Project Defense – Batch 2026','curricular',     'Academic',     'CCS Admin',         'CCS Seminar Room A',           '2026-04-07','2026-04-11','Final defense of capstone projects for graduating students.',                   'ongoing',  null,  60],
            // Completed
            ['Tech Talk: Cybersecurity Essentials', 'curricular',      'Seminar',      'CCS Admin',         'CCS Auditorium',               '2026-03-10','2026-03-10','Talk on ethical hacking, penetration testing, and data privacy.',               'completed',$csId, 120],
            ['IT Quiz Bee – Elimination Round',     'curricular',      'Competition',  'CCS Admin',         'CCS Room 201',                 '2026-02-20','2026-02-20','Elimination round for the annual IT Quiz Bee competition.',                     'completed',$itId, 50],
            ['Leadership & Values Formation Seminar','extra_curricular','Seminar',     'CCS Admin',         'CCS Auditorium',               '2026-02-05','2026-02-05','Seminar on student leadership, integrity, and professional values.',             'completed', null, 180],
            ['Open Source Contribution Drive',      'curricular',      'Workshop',     'CCS Admin',         'CCS Lab 2',                    '2026-01-25','2026-01-25','Students contribute to real open-source projects on GitHub.',                   'completed',$csId, 35],
            ['Interschool Programming Contest',     'curricular',      'Competition',  'CCS Admin',         'CCS Computer Laboratory',      '2026-01-15','2026-01-15','Programming contest with participants from 5 partner schools.',                 'completed',$itId, 60],
            ['Blood Donation Drive – 1st Semester', 'extra_curricular','Community Service','CCS Admin',     'CCS Lobby',                    '2025-11-20','2025-11-20','Quarterly blood donation drive in partnership with Philippine Red Cross.',      'completed', null, 100],
        ];

        foreach ($events as $e) {
            [$title, $type, $cat, $org, $venue, $start, $end, $desc, $status, $deptId, $maxP] = $e;

            $event = Event::firstOrCreate(['title' => $title], [
                'type'            => $type,
                'category'        => $cat,
                'organizer'       => $org,
                'venue'           => $venue,
                'date_start'      => $start,
                'date_end'        => $end,
                'description'     => $desc,
                'status'          => $status,
                'department_id'   => $deptId,
                'max_participants' => $maxP,
            ]);

            // Add some student participants to completed/ongoing events
            if (in_array($status, ['completed', 'ongoing'])) {
                $studentIds = Student::inRandomOrder()->limit(rand(5, 15))->pluck('id');
                foreach ($studentIds as $sid) {
                    EventParticipant::firstOrCreate(
                        ['event_id' => $event->id, 'participable_type' => Student::class, 'participable_id' => $sid],
                        ['role' => 'participant', 'award' => null, 'remarks' => null]
                    );
                }
            }
        }

        $this->command->info('✓ 12 events seeded with participants');
    }
}
