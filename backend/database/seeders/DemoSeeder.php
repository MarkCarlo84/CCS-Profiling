<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Event;
use App\Models\EventParticipant;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Hash once, reuse everywhere — bcrypt is intentionally slow
        $this->teacherHash = Hash::make('Teacher1234');
        $this->studentHash = Hash::make('Student1234');

        DB::transaction(function () {
            $this->seedFaculty();
            $this->seedStudents();
            $this->seedEvents();
        });
        $this->command->info('✓ DemoSeeder complete');
    }

    private string $teacherHash;
    private string $studentHash;

    private function now(): string { return Carbon::now()->toDateTimeString(); }

    // ─────────────────────────────────────────────────────────────────────────
    // FACULTY
    // ─────────────────────────────────────────────────────────────────────────
    private function seedFaculty(): void
    {
        $teachers = [
            ['FAC-IT-001','Maria','Santos','Cruz',    'IT','Instructor I',          'maria.santos@ccs.edu.ph',    '09171234501'],
            ['FAC-IT-002','Jose', 'Reyes', 'Bautista','IT','Instructor II',         'jose.reyes@ccs.edu.ph',      '09171234502'],
            ['FAC-IT-003','Ana',  'Garcia','Dela Cruz','IT','Assistant Professor',  'ana.garcia@ccs.edu.ph',      '09171234503'],
            ['FAC-IT-004','Carlo','Mendoza','Lim',    'IT','Instructor I',          'carlo.mendoza@ccs.edu.ph',   '09171234504'],
            ['FAC-IT-005','Liza', 'Torres', 'Ramos',  'IT','Instructor II',        'liza.torres@ccs.edu.ph',     '09171234505'],
            ['FAC-IT-006','Ramon','Villanueva','Tan',  'IT','Associate Professor',  'ramon.villanueva@ccs.edu.ph','09171234506'],
            ['FAC-IT-007','Grace','Aquino', 'Flores', 'IT','Instructor I',         'grace.aquino@ccs.edu.ph',    '09171234507'],
            ['FAC-CS-001','Miguel','Castillo','Navarro','CS','Assistant Professor', 'miguel.castillo@ccs.edu.ph', '09181234501'],
            ['FAC-CS-002','Rosa',  'Fernandez','Gomez','CS','Instructor II',        'rosa.fernandez@ccs.edu.ph',  '09181234502'],
            ['FAC-CS-003','Dante', 'Morales',  'Perez','CS','Associate Professor', 'dante.morales@ccs.edu.ph',   '09181234503'],
            ['FAC-CS-004','Celia', 'Pascual',  'Diaz', 'CS','Instructor I',        'celia.pascual@ccs.edu.ph',   '09181234504'],
            ['FAC-CS-005','Ernesto','Salazar', 'Ruiz', 'CS','Instructor II',       'ernesto.salazar@ccs.edu.ph', '09181234505'],
            ['FAC-CS-006','Nora',  'Jimenez',  'Vega', 'CS','Assistant Professor', 'nora.jimenez@ccs.edu.ph',    '09181234506'],
            ['FAC-CS-007','Felix', 'Herrera',  'Abad', 'CS','Instructor I',        'felix.herrera@ccs.edu.ph',   '09181234507'],
            ['FAC-CS-008','Teresita','Ocampo', 'Luna', 'CS','Associate Professor', 'teresita.ocampo@ccs.edu.ph', '09181234508'],
        ];

        $itSubjects = DB::table('subjects')->where('program', 'Information Technology')->pluck('id')->toArray();
        $csSubjects = DB::table('subjects')->where('program', 'Computer Science')->pluck('id')->toArray();

        $facultyRows = [];
        $userRows    = [];
        $fsRows      = [];
        $now         = $this->now();

        foreach ($teachers as $t) {
            [$fid, $fn, $ln, $mn, $dept, $pos, $email, $phone] = $t;
            if (DB::table('faculties')->where('faculty_id', $fid)->exists()) continue;

            $facultyId = DB::table('faculties')->insertGetId([
                'faculty_id' => $fid, 'first_name' => $fn, 'last_name' => $ln,
                'middle_name' => $mn, 'department' => $dept, 'position' => $pos,
                'email' => $email, 'contact_number' => $phone,
                'created_at' => $now, 'updated_at' => $now,
            ]);

            if (!DB::table('users')->where('email', $email)->exists()) {
                DB::table('users')->insert([
                    'name' => "$fn $ln", 'email' => $email,
                    'password' => $this->teacherHash, 'role' => 'teacher',
                    'faculty_id' => $facultyId, 'created_at' => $now, 'updated_at' => $now,
                ]);
            }

            $pool = str_starts_with($fid, 'FAC-IT') ? $itSubjects : $csSubjects;
            $assigned = collect($pool)->shuffle()->take(rand(3, 5));
            foreach ($assigned as $subjectId) {
                $fsRows[] = [
                    'faculty_id' => $facultyId, 'subject_id' => $subjectId,
                    'school_year' => '2025-2026', 'semester' => '2nd',
                    'created_at' => $now, 'updated_at' => $now,
                ];
            }
        }

        // Bulk insert faculty_subjects, ignore duplicates
        foreach (array_chunk($fsRows, 50) as $chunk) {
            DB::table('faculty_subjects')->insertOrIgnore($chunk);
        }

        $this->command->info('✓ Faculty seeded');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STUDENTS
    // ─────────────────────────────────────────────────────────────────────────
    private function seedStudents(): void
    {
        $students = [
            ['2500101','IT','Juan',    'Dela','Cruz',      19,'Male',  '1st Year','2025-01-10','active','Quezon City'],
            ['2500102','IT','Patricia','Mae', 'Reyes',     18,'Female','1st Year','2025-01-10','active','Caloocan'],
            ['2500103','IT','Marco',   'Luis','Bautista',  19,'Male',  '1st Year','2025-01-10','active','Marikina'],
            ['2500104','IT','Sheila',  'Ann', 'Gomez',     18,'Female','1st Year','2025-01-10','active','Pasig'],
            ['2500105','IT','Renz',    'Karl','Villanueva',19,'Male',  '1st Year','2025-01-10','active','Mandaluyong'],
            ['2400101','IT','Kristine','Joy', 'Santos',    20,'Female','2nd Year','2024-06-10','active','Taguig'],
            ['2400102','IT','Aldrin',  'Paul','Mendoza',   20,'Male',  '2nd Year','2024-06-10','active','Paranaque'],
            ['2400103','IT','Camille', 'Rose','Aquino',    19,'Female','2nd Year','2024-06-10','active','Las Pinas'],
            ['2400104','IT','Jericho', 'Noel','Flores',    20,'Male',  '2nd Year','2024-06-10','active','Muntinlupa'],
            ['2400105','IT','Maricel', 'Ann', 'Torres',    20,'Female','2nd Year','2024-06-10','active','Valenzuela'],
            ['2300101','IT','Ronaldo', 'Jose','Pascual',   21,'Male',  '3rd Year','2023-06-10','active','Malabon'],
            ['2300102','IT','Jasmine', 'Luz', 'Navarro',   21,'Female','3rd Year','2023-06-10','active','Navotas'],
            ['2300103','IT','Arvin',   'Rey', 'Castillo',  22,'Male',  '3rd Year','2023-06-10','active','San Juan'],
            ['2300104','IT','Lovely',  'Mae', 'Morales',   21,'Female','3rd Year','2023-06-10','active','Mandaluyong'],
            ['2300105','IT','Dennis',  'Cruz','Salazar',   22,'Male',  '3rd Year','2023-06-10','active','Quezon City'],
            ['2300106','IT','Rhea',    'Joy', 'Jimenez',   21,'Female','3rd Year','2023-06-10','active','Caloocan'],
            ['2200101','IT','Marvin',  'Ace', 'Herrera',   23,'Male',  '4th Year','2022-06-10','active','Marikina'],
            ['2200102','IT','Joanna',  'Faye','Ocampo',    22,'Female','4th Year','2022-06-10','active','Pasig'],
            ['2200103','IT','Elmer',   'Dan', 'Perez',     23,'Male',  '4th Year','2022-06-10','active','Taguig'],
            ['2200104','IT','Vanessa', 'Lyn', 'Ruiz',      22,'Female','4th Year','2022-06-10','active','Paranaque'],
            ['2200105','IT','Noel',    'Gio', 'Vega',      23,'Male',  '4th Year','2022-06-10','active','Las Pinas'],
            ['2200106','IT','Abigail', 'Rae', 'Abad',      22,'Female','4th Year','2022-06-10','active','Muntinlupa'],
            ['2500201','CS','Lester',  'John','Diaz',      18,'Male',  '1st Year','2025-01-10','active','Quezon City'],
            ['2500202','CS','Angelica','Mae', 'Luna',      18,'Female','1st Year','2025-01-10','active','Caloocan'],
            ['2500203','CS','Cyrus',   'Lee', 'Tan',       19,'Male',  '1st Year','2025-01-10','active','Marikina'],
            ['2500204','CS','Hazel',   'Ann', 'Lim',       18,'Female','1st Year','2025-01-10','active','Pasig'],
            ['2400201','CS','Jomar',   'Rex', 'Ramos',     20,'Male',  '2nd Year','2024-06-10','active','Mandaluyong'],
            ['2400202','CS','Tricia',  'Lyn', 'Dela Cruz', 19,'Female','2nd Year','2024-06-10','active','Taguig'],
            ['2400203','CS','Aldous',  'Kai', 'Bautista',  20,'Male',  '2nd Year','2024-06-10','active','Paranaque'],
            ['2400204','CS','Mylene',  'Joy', 'Garcia',    19,'Female','2nd Year','2024-06-10','active','Las Pinas'],
            ['2400205','CS','Rodel',   'Mar', 'Reyes',     20,'Male',  '2nd Year','2024-06-10','active','Muntinlupa'],
            ['2300201','CS','Sheena',  'Rae', 'Santos',    21,'Female','3rd Year','2023-06-10','active','Valenzuela'],
            ['2300202','CS','Gino',    'Paul','Mendoza',   22,'Male',  '3rd Year','2023-06-10','active','Malabon'],
            ['2300203','CS','Kristel', 'Ann', 'Aquino',    21,'Female','3rd Year','2023-06-10','active','Navotas'],
            ['2300204','CS','Nico',    'Jay', 'Flores',    22,'Male',  '3rd Year','2023-06-10','active','San Juan'],
            ['2300205','CS','Pamela',  'Rose','Torres',    21,'Female','3rd Year','2023-06-10','active','Mandaluyong'],
            ['2200201','CS','Renato',  'Ace', 'Pascual',   23,'Male',  '4th Year','2022-06-10','active','Quezon City'],
            ['2200202','CS','Lorraine','Faye','Navarro',   22,'Female','4th Year','2022-06-10','active','Caloocan'],
            ['2200203','CS','Aldrin',  'Dan', 'Castillo',  23,'Male',  '4th Year','2022-06-10','active','Marikina'],
            ['2200204','CS','Maribel', 'Luz', 'Morales',   22,'Female','4th Year','2022-06-10','active','Pasig'],
        ];

        $syMap = ['1st Year'=>'2025-2026','2nd Year'=>'2024-2025','3rd Year'=>'2023-2024','4th Year'=>'2022-2023'];
        $yearNum = ['1st Year'=>1,'2nd Year'=>2,'3rd Year'=>3,'4th Year'=>4];
        $now = $this->now();

        // Pre-load subjects grouped by program/year/semester for fast lookup
        $subjects = DB::table('subjects')->get()->groupBy(fn($s) => $s->program . '|' . $s->year_level . '|' . $s->semester);

        $affiliationRows = [];
        $skillRows       = [];
        $historyRows     = [];
        $recordRows      = [];
        $gradeRows       = [];
        $violationRows   = [];

        $affiliationPool = [
            ['CCS Student Council','Academic'],['Google Developer Student Club','Academic'],
            ['AWS Cloud Club','Academic'],['ACM Student Chapter','Academic'],
            ['Junior Philippine Computer Society','Academic'],['Red Cross Youth','Civic'],
            ['Rotaract Club','Civic'],['Youth for Environment','Civic'],
            ['University Basketball Team','Sports'],['Volleyball Club','Sports'],
            ['Chess Club','Sports'],['Badminton Club','Sports'],
            ['CCS Dance Troupe','Cultural'],['University Chorale','Cultural'],
            ['Photography Club','Cultural'],['Cybersecurity Club','Technical'],
            ['Game Development Society','Technical'],['Open Source Advocates','Technical'],
        ];

        $itSkillPool = [
            ['PHP Laravel','intermediate',1],['JavaScript','intermediate',0],['React.js','beginner',0],
            ['MySQL','intermediate',1],['Python','beginner',0],['HTML/CSS','advanced',0],
            ['Node.js','beginner',0],['Git & GitHub','intermediate',1],
            ['REST API Development','intermediate',0],['Docker','beginner',0],
            ['Linux Administration','beginner',0],['Network Troubleshooting','intermediate',1],
            ['Figma / UI Design','beginner',0],['WordPress','intermediate',0],
        ];
        $csSkillPool = [
            ['C++ Programming','advanced',1],['Java','intermediate',1],['Python','advanced',1],
            ['Data Structures','advanced',0],['Algorithm Design','intermediate',0],
            ['Machine Learning','beginner',0],['Unity Game Engine','intermediate',1],
            ['OpenGL','beginner',0],['Discrete Mathematics','intermediate',0],
            ['Operating Systems','intermediate',0],['Compiler Design','beginner',0],
            ['Computer Graphics','beginner',0],['Artificial Intelligence','intermediate',1],
            ['Git & GitHub','intermediate',0],
        ];

        $activityPool = [
            ['Intramural Basketball Tournament','Sports','Competed in the annual university intramural games','Player','CCS Sports Committee','Win'],
            ['Hackathon 2024','Competition','24-hour coding competition focused on social impact solutions','Participant','DICT Philippines','2nd Place'],
            ['CCS Foundation Week','Cultural','Annual week-long celebration of the college','Performer','CCS Student Council',null],
            ['Regional IT Quiz Bee','Competition','Regional-level quiz competition covering IT fundamentals','Contestant','DepEd Region IV',null],
            ['Community Tech Literacy Drive','Community Service','Taught basic computer skills to senior citizens','Volunteer','Rotaract Club',null],
            ['National Coding Competition','Competition','Competed in a national-level programming contest','Contestant','PSITE National','3rd Place'],
            ['University Sportsfest Volleyball','Sports','Participated in the university-wide volleyball tournament','Player','University Athletics Office','Runner-up'],
            ['Tech Talk: AI in Education','Seminar','Attended a seminar on AI in modern education','Attendee','Google Philippines',null],
            ['Campus Photography Exhibit','Cultural','Showcased original photography work','Exhibitor','Photography Club',null],
            ['Blood Donation Drive','Community Service','Participated in the quarterly blood donation drive','Donor','Philippine Red Cross',null],
        ];

        $violationPool = [
            ['Tardiness','Arrived more than 30 minutes late to class.','minor','Verbal warning issued.'],
            ['Cheating','Caught copying answers during a major examination.','major','Given a grade of 0; parents notified.'],
            ['Dress Code Violation','Wore non-prescribed attire inside campus.','minor','Written warning issued.'],
            ['Disruptive Behavior','Repeatedly disrupted class using a mobile phone.','minor','Phone confiscated.'],
            ['Plagiarism','Submitted a paper with portions copied from online sources.','major','Required to resubmit; grade deducted 30%.'],
            ['Vandalism','Found writing on school property.','major','Required to pay for damages.'],
            ['Unauthorized Absence','Accumulated 5 consecutive absences.','minor','Counseling session scheduled.'],
            ['Bullying','Reported for repeatedly mocking a classmate.','major','Suspended for 3 days.'],
        ];

        $grades = [1.00, 1.25, 1.50, 2.00, 2.25, 2.50, 3.00];

        foreach ($students as $s) {
            [$sid, $dept, $fn, $mn, $ln, $age, $gender, $yearLevel, $enrollDate, $status, $address] = $s;
            if (DB::table('students')->where('student_id', $sid)->exists()) continue;

            $email = strtolower($fn . '.' . $ln . rand(10,99) . '@student.ccs.edu.ph');
            $studentId = DB::table('students')->insertGetId([
                'student_id' => $sid, 'department' => $dept,
                'first_name' => $fn, 'middle_name' => $mn, 'last_name' => $ln,
                'age' => $age, 'gender' => $gender, 'address' => $address . ', Metro Manila',
                'contact_number' => '0917' . rand(1000000,9999999), 'email' => $email,
                'enrollment_date' => $enrollDate, 'status' => $status,
                'date_of_birth' => Carbon::now()->subYears($age)->subDays(rand(0,364))->format('Y-m-d'),
                'guardian_name' => 'Parent of ' . $fn . ' ' . $ln,
                'created_at' => $now, 'updated_at' => $now,
            ]);

            if (!DB::table('users')->where('email', $email)->exists()) {
                DB::table('users')->insert([
                    'name' => "$fn $ln", 'email' => $email,
                    'password' => $this->studentHash, 'role' => 'student',
                    'student_id' => $studentId, 'created_at' => $now, 'updated_at' => $now,
                ]);
            }

            // Affiliations
            $affPicks = collect($affiliationPool)->shuffle()->take(rand(1,3));
            foreach ($affPicks as [$name, $type]) {
                $affiliationRows[] = [
                    'student_id' => $studentId, 'name' => $name, 'type' => $type,
                    'role' => 'Member',
                    'date_joined' => Carbon::now()->subMonths(rand(3,36))->format('Y-m-d'),
                    'created_at' => $now, 'updated_at' => $now,
                ];
            }

            // Skills
            $skillPool = $dept === 'IT' ? $itSkillPool : $csSkillPool;
            $skillPicks = collect($skillPool)->shuffle()->take(rand(2,4));
            foreach ($skillPicks as [$name, $level, $cert]) {
                $skillRows[] = [
                    'student_id' => $studentId, 'skill_name' => $name,
                    'skill_level' => $level, 'certification' => $cert,
                    'created_at' => $now, 'updated_at' => $now,
                ];
            }

            // Non-academic history
            $actPicks = collect($activityPool)->shuffle()->take(rand(1,2));
            foreach ($actPicks as [$title, $cat, $desc, $role, $org, $result]) {
                $start = Carbon::now()->subMonths(rand(6,30));
                $historyRows[] = [
                    'student_id' => $studentId, 'activity_title' => $title,
                    'category' => $cat, 'description' => $desc,
                    'date_started' => $start->format('Y-m-d'),
                    'date_ended' => $start->addDays(rand(1,5))->format('Y-m-d'),
                    'role' => $role, 'organizer' => $org, 'game_result' => $result,
                    'created_at' => $now, 'updated_at' => $now,
                ];
            }

            // Academic records + grades
            $yn = $yearNum[$yearLevel];
            $program = $dept === 'IT' ? 'Information Technology' : 'Computer Science';
            for ($y = 1; $y <= $yn; $y++) {
                $sems = ($y === $yn) ? ['1st'] : ['1st', '2nd'];
                $sy = match($y) { 1=>'2025-2026', 2=>'2024-2025', 3=>'2023-2024', 4=>'2022-2023' };
                $yearLabel = match($y) { 1=>'1st Year', 2=>'2nd Year', 3=>'3rd Year', 4=>'4th Year' };
                foreach ($sems as $sem) {
                    $semLabel = $sem === '1st' ? '1st Semester' : '2nd Semester';
                    $recordId = DB::table('academic_records')->insertGetId([
                        'student_id' => $studentId, 'school_year' => $sy,
                        'semester' => $sem, 'year_level' => $y, 'gpa' => null,
                        'created_at' => $now, 'updated_at' => $now,
                    ]);
                    $subs = $subjects->get($program . '|' . $yearLabel . '|' . $semLabel, collect());
                    $totalGpa = 0; $count = 0;
                    foreach ($subs as $sub) {
                        $score = $grades[array_rand($grades)];
                        $gradeRows[] = [
                            'academic_record_id' => $recordId, 'subject_id' => $sub->id,
                            'subject_name' => $sub->subject_name, 'score' => $score,
                            'remarks' => $score <= 3.00 ? 'Passed' : 'Failed',
                            'created_at' => $now, 'updated_at' => $now,
                        ];
                        $totalGpa += $score; $count++;
                    }
                    if ($count > 0) {
                        DB::table('academic_records')->where('id', $recordId)
                            ->update(['gpa' => round($totalGpa / $count, 2)]);
                    }
                }
            }

            // Violations (~40%)
            if (rand(1,10) <= 4) {
                $vPick = $violationPool[array_rand($violationPool)];
                [$vtype, $vdesc, $vsev, $vaction] = $vPick;
                $committed = Carbon::now()->subMonths(rand(1,18));
                $resolved = $vsev === 'minor' && rand(0,1);
                $violationRows[] = [
                    'student_id' => $studentId, 'violation_type' => $vtype,
                    'description' => $vdesc, 'date_committed' => $committed->format('Y-m-d'),
                    'severity_level' => $vsev, 'action_taken' => $vaction,
                    'is_resolved' => (int)$resolved,
                    'resolved_at' => $resolved ? $committed->addDays(rand(3,14))->toDateTimeString() : null,
                    'created_at' => $now, 'updated_at' => $now,
                ];
            }
        }

        // Bulk inserts
        foreach (array_chunk($affiliationRows, 100) as $chunk) DB::table('affiliations')->insert($chunk);
        foreach (array_chunk($skillRows, 100) as $chunk)       DB::table('skills')->insert($chunk);
        foreach (array_chunk($historyRows, 100) as $chunk)     DB::table('non_academic_histories')->insert($chunk);
        foreach (array_chunk($gradeRows, 100) as $chunk)       DB::table('grades')->insert($chunk);
        foreach (array_chunk($violationRows, 100) as $chunk)   DB::table('violations')->insert($chunk);

        $this->command->info('✓ 40 students seeded with full profiles');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────────────────
    private function seedEvents(): void
    {
        $itId = DB::table('departments')->where('code', 'IT')->value('id');
        $csId = DB::table('departments')->where('code', 'CS')->value('id');
        $now  = $this->now();

        $events = [
            ['CCS Intramural Games 2026',            'extra_curricular','Sports',          'University Gymnasium',    '2026-05-10','2026-05-12','Annual intramural sports competition.',                    'upcoming', null,  200],
            ['Hackathon: Code for Change 2026',      'curricular',      'Competition',     'CCS Computer Laboratory', '2026-05-20','2026-05-21','24-hour hackathon for social impact solutions.',           'upcoming', $itId, 80],
            ['AI & Machine Learning Summit',         'curricular',      'Seminar',         'CCS Auditorium',          '2026-06-05','2026-06-05','Industry speakers on AI and ML trends.',                  'upcoming', $csId, 150],
            ['Web Dev Workshop: React & Laravel',    'curricular',      'Workshop',        'CCS Lab 3',               '2026-06-15','2026-06-16','Hands-on full-stack web application workshop.',            'upcoming', $itId, 40],
            ['CCS Foundation Week 2026',             'extra_curricular','Cultural',        'CCS Campus Grounds',      '2026-07-01','2026-07-05','Week-long celebration with cultural shows and exhibits.',  'upcoming', null,  500],
            ['Capstone Project Defense – Batch 2026','curricular',      'Academic',        'CCS Seminar Room A',      '2026-04-07','2026-04-11','Final defense of capstone projects.',                     'ongoing',  null,  60],
            ['Tech Talk: Cybersecurity Essentials',  'curricular',      'Seminar',         'CCS Auditorium',          '2026-03-10','2026-03-10','Talk on ethical hacking and data privacy.',               'completed',$csId, 120],
            ['IT Quiz Bee – Elimination Round',      'curricular',      'Competition',     'CCS Room 201',            '2026-02-20','2026-02-20','Elimination round for the annual IT Quiz Bee.',            'completed',$itId, 50],
            ['Leadership & Values Formation Seminar','extra_curricular','Seminar',         'CCS Auditorium',          '2026-02-05','2026-02-05','Seminar on student leadership and professional values.',   'completed', null, 180],
            ['Open Source Contribution Drive',       'curricular',      'Workshop',        'CCS Lab 2',               '2026-01-25','2026-01-25','Students contribute to real open-source projects.',        'completed',$csId, 35],
            ['Interschool Programming Contest',      'curricular',      'Competition',     'CCS Computer Laboratory', '2026-01-15','2026-01-15','Programming contest with 5 partner schools.',              'completed',$itId, 60],
            ['Blood Donation Drive – 1st Semester',  'extra_curricular','Community Service','CCS Lobby',              '2025-11-20','2025-11-20','Quarterly blood donation drive with Philippine Red Cross.','completed', null, 100],
        ];

        $studentIds = DB::table('students')->pluck('id')->toArray();
        $participantRows = [];

        foreach ($events as $e) {
            [$title, $type, $cat, $venue, $start, $end, $desc, $status, $deptId, $maxP] = $e;
            if (DB::table('events')->where('title', $title)->exists()) continue;

            $eventId = DB::table('events')->insertGetId([
                'title' => $title, 'type' => $type, 'category' => $cat,
                'organizer' => 'CCS Admin', 'venue' => $venue,
                'date_start' => $start, 'date_end' => $end, 'description' => $desc,
                'status' => $status, 'department_id' => $deptId, 'max_participants' => $maxP,
                'created_at' => $now, 'updated_at' => $now,
            ]);

            if (in_array($status, ['completed', 'ongoing'])) {
                $picks = collect($studentIds)->shuffle()->take(rand(5, 15));
                foreach ($picks as $sid) {
                    $participantRows[] = [
                        'event_id' => $eventId, 'participable_type' => 'App\\Models\\Student',
                        'participable_id' => $sid, 'role' => 'participant',
                        'award' => null, 'remarks' => null,
                        'created_at' => $now, 'updated_at' => $now,
                    ];
                }
            }
        }

        foreach (array_chunk($participantRows, 100) as $chunk) {
            DB::table('event_participants')->insertOrIgnore($chunk);
        }

        $this->command->info('✓ 12 events seeded');
    }
}
