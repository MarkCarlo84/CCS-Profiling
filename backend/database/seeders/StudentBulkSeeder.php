<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StudentBulkSeeder extends Seeder
{
    private string $studentHash;
    private string $now;

    private array $firstNamesMale = [
        'Juan','Marco','Renz','Aldrin','Jericho','Ronaldo','Arvin','Dennis','Marvin','Elmer',
        'Noel','Lester','Cyrus','Jomar','Aldous','Rodel','Gino','Nico','Renato','Miguel',
        'Carlo','Ramon','Felix','Dante','Ernesto','Jose','Angelo','Bryan','Christian','Daniel',
        'Eduardo','Francis','Gerald','Harold','Ivan','Jerome','Kevin','Lance','Manuel','Nathan',
        'Oliver','Patrick','Quincy','Rafael','Samuel','Timothy','Ulysses','Victor','Warren','Xavier',
        'Yvan','Zachary','Aaron','Benedict','Clifford','Dominic','Edgardo','Ferdinand','Gilbert',
        'Hector','Ignacio','Jaime','Kenneth','Leonardo','Marcelo','Nicolas','Orlando','Pedro',
        'Rodrigo','Salvador','Tomas','Alvin','Benito','Cesar','Diego','Emilio','Florencio',
    ];

    private array $firstNamesFemale = [
        'Patricia','Sheila','Kristine','Camille','Maricel','Jasmine','Lovely','Rhea','Joanna',
        'Vanessa','Abigail','Angelica','Hazel','Tricia','Mylene','Sheena','Kristel','Pamela',
        'Lorraine','Maribel','Maria','Ana','Liza','Grace','Rosa','Celia','Nora','Teresita',
        'Andrea','Beatrice','Carla','Diana','Elena','Fatima','Gloria','Helen','Irene','Juliet',
        'Karen','Lourdes','Melissa','Norma','Olivia','Pauline','Queenie','Rowena','Stella',
        'Theresa','Veronica','Wendy','Yolanda','Zenaida','Alicia','Bernadette','Cecilia',
        'Dolores','Esperanza','Felicitas','Guadalupe','Herminia','Imelda','Josefina','Katrina',
    ];

    private array $middleNames = [
        'Dela','Mae','Luis','Ann','Karl','Joy','Paul','Rose','Noel','Faye','Ace','Dan','Lyn',
        'Rae','Gio','John','Lee','Rex','Kai','Mar','Jay','Cruz','Luz','Rey','Jose',
        'Bautista','Santos','Reyes','Garcia','Mendoza','Torres','Flores','Aquino','Castillo',
        'Marie','Grace','Faith','Hope','Angel','Mark','James','Luke','Andrew','Philip',
    ];

    private array $lastNames = [
        'Dela Cruz','Reyes','Bautista','Gomez','Villanueva','Santos','Mendoza','Aquino','Flores',
        'Torres','Pascual','Navarro','Castillo','Morales','Salazar','Jimenez','Herrera','Ocampo',
        'Perez','Ruiz','Vega','Abad','Diaz','Luna','Tan','Lim','Ramos','Garcia','Cruz','Fernandez',
        'Lopez','Martinez','Rodriguez','Sanchez','Ramirez','Gonzalez','Hernandez','Vargas','Rojas',
        'Medina','Aguilar','Ortega','Guerrero','Delgado','Ibarra','Soriano','Magno','Buenaventura',
        'Macaraeg','Tolentino','Manalo','Delos Santos','De Leon','De Guzman','Evangelista',
        'Espiritu','Enriquez','Domingo','Dizon','Corpuz','Coronel','Constantino','Concepcion',
    ];

    private array $cities = [
        'Quezon City','Caloocan','Marikina','Pasig','Mandaluyong','Taguig','Paranaque',
        'Las Pinas','Muntinlupa','Valenzuela','Malabon','Navotas','San Juan','Makati',
        'Pasay','Manila','Antipolo','San Mateo','Cainta','Taytay','Angono','Binangonan',
    ];

    private array $barangays = [
        'Brgy. Bagong Silang','Brgy. Commonwealth','Brgy. Batasan Hills','Brgy. Holy Spirit',
        'Brgy. Payatas','Brgy. Fairview','Brgy. Novaliches','Brgy. Tandang Sora',
        'Brgy. San Isidro','Brgy. Sta. Cruz','Brgy. Poblacion','Brgy. San Antonio',
        'Brgy. Marikina Heights','Brgy. Concepcion','Brgy. Nangka','Brgy. Parang',
        'Brgy. Kapitolyo','Brgy. Ugong','Brgy. Manggahan','Brgy. Rosario',
        'Brgy. Western Bicutan','Brgy. Signal Village','Brgy. BF Homes','Brgy. Alabang',
    ];

    private array $streets = ['Sampaguita','Rosal','Ilang-Ilang','Dahlia','Camia','Adelfa','Jasmine','Orchid'];

    private array $guardianFirstNames = [
        'Roberto','Maricel','Eduardo','Lourdes','Antonio','Rosario','Fernando','Gloria',
        'Ricardo','Teresita','Alfredo','Corazon','Bernardo','Milagros','Ernesto','Felicidad',
        'Domingo','Natividad','Rodrigo','Carmelita','Renato','Remedios','Virgilio','Adoracion',
    ];

    private array $guardianRelations = ['Father','Mother','Uncle','Aunt','Grandfather','Grandmother','Elder Brother','Elder Sister'];
    private array $emergencyRelations = ['Mother','Father','Aunt','Uncle','Elder Brother','Elder Sister','Cousin'];

    private array $emergencyFirstNames = [
        'Josefina','Ernesto','Carmelita','Rodrigo','Felicitas','Domingo','Natividad','Alfredo',
        'Marilou','Renato','Cynthia','Arnel','Divina','Rogelio','Estrella','Wilfredo',
    ];

    private array $contactPrefixes = ['0917','0918','0919','0920','0921','0926','0927','0928','0929','0930','0935','0939','0947','0956','0961','0977','0995','0998','0999'];

    private array $affiliationPool = [
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

    private array $itSkillPool = [
        ['PHP Laravel','intermediate',1],['JavaScript','intermediate',0],['React.js','beginner',0],
        ['MySQL','intermediate',1],['Python','beginner',0],['HTML/CSS','advanced',0],
        ['Node.js','beginner',0],['Git & GitHub','intermediate',1],
        ['REST API Development','intermediate',0],['Docker','beginner',0],
        ['Linux Administration','beginner',0],['Network Troubleshooting','intermediate',1],
        ['Figma / UI Design','beginner',0],['WordPress','intermediate',0],
    ];

    private array $csSkillPool = [
        ['C++ Programming','advanced',1],['Java','intermediate',1],['Python','advanced',1],
        ['Data Structures','advanced',0],['Algorithm Design','intermediate',0],
        ['Machine Learning','beginner',0],['Unity Game Engine','intermediate',1],
        ['OpenGL','beginner',0],['Discrete Mathematics','intermediate',0],
        ['Operating Systems','intermediate',0],['Compiler Design','beginner',0],
        ['Computer Graphics','beginner',0],['Artificial Intelligence','intermediate',1],
        ['Git & GitHub','intermediate',0],
    ];

    private array $activityPool = [
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

    private array $violationPool = [
        ['Tardiness','Arrived more than 30 minutes late to class.','minor','Verbal warning issued.'],
        ['Cheating','Caught copying answers during a major examination.','major','Given a grade of 0; parents notified.'],
        ['Dress Code Violation','Wore non-prescribed attire inside campus.','minor','Written warning issued.'],
        ['Disruptive Behavior','Repeatedly disrupted class using a mobile phone.','minor','Phone confiscated.'],
        ['Plagiarism','Submitted a paper with portions copied from online sources.','major','Required to resubmit; grade deducted 30%.'],
        ['Vandalism','Found writing on school property.','major','Required to pay for damages.'],
        ['Unauthorized Absence','Accumulated 5 consecutive absences.','minor','Counseling session scheduled.'],
        ['Bullying','Reported for repeatedly mocking a classmate.','major','Suspended for 3 days.'],
    ];

    private array $gradeValues = [1.00, 1.25, 1.50, 2.00, 2.25, 2.50, 3.00];

    public function run(): void
    {
        $this->studentHash = Hash::make('Student1234');
        $this->now = Carbon::now()->toDateTimeString();

        DB::transaction(function () {
            $this->seedBulkStudents();
        });

        $this->command->info('✓ StudentBulkSeeder complete — 960 students seeded');
    }

    private function seedBulkStudents(): void
    {
        // Pre-load subjects grouped for fast lookup
        $subjects = DB::table('subjects')->get()
            ->groupBy(fn($s) => $s->program . '|' . $s->year_level . '|' . $s->semester);

        $yearLevels  = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        $departments = ['IT', 'CS'];
        $yearNum     = ['1st Year' => 1, '2nd Year' => 2, '3rd Year' => 3, '4th Year' => 4];
        $enrollDates = ['1st Year' => '2025-01-10', '2nd Year' => '2024-06-10', '3rd Year' => '2023-06-10', '4th Year' => '2022-06-10'];
        $syMap       = [1 => '2025-2026', 2 => '2024-2025', 3 => '2023-2024', 4 => '2022-2023'];

        // Pre-load existing IDs/emails to avoid duplicates
        $usedIds    = DB::table('students')->pluck('student_id')->flip()->toArray();
        $usedEmails = DB::table('users')->pluck('email')->flip()->toArray();

        $affiliationRows = [];
        $skillRows       = [];
        $historyRows     = [];
        $gradeRows       = [];
        $violationRows   = [];
        $gpaUpdates      = []; // [record_id => gpa]

        $generated = 0;

        foreach ($yearLevels as $yearLevel) {
            foreach ($departments as $dept) {
                $yn      = $yearNum[$yearLevel];
                $program = $dept === 'IT' ? 'Information Technology' : 'Computer Science';
                $prefix  = substr((string)(2026 - $yn), 2);
                $deptCode = $dept === 'IT' ? '1' : '2';

                // Build 120 student rows + user rows for bulk insert
                $studentRows = [];
                $userPayloads = []; // store data needed to build user rows after student insert

                for ($i = 0; $i < 120; $i++) {
                    $section = ['A','B','C','D'][intdiv($i, 30)];

                    // Unique student ID
                    $counter = 200 + $generated + $i;
                    $sid = $prefix . '0' . $deptCode . str_pad($counter, 3, '0', STR_PAD_LEFT);
                    while (isset($usedIds[$sid])) {
                        $counter++;
                        $sid = $prefix . '0' . $deptCode . str_pad($counter, 3, '0', STR_PAD_LEFT);
                    }
                    $usedIds[$sid] = true;

                    $gender = ($i % 2 === 0) ? 'Male' : 'Female';
                    $fn = $gender === 'Male'
                        ? $this->firstNamesMale[array_rand($this->firstNamesMale)]
                        : $this->firstNamesFemale[array_rand($this->firstNamesFemale)];
                    $mn = $this->middleNames[array_rand($this->middleNames)];
                    $ln = $this->lastNames[array_rand($this->lastNames)];
                    $age = $yn === 1 ? rand(17, 19) : ($yn === 2 ? rand(19, 21) : ($yn === 3 ? rand(20, 22) : rand(21, 24)));

                    $city     = $this->cities[array_rand($this->cities)];
                    $barangay = $this->barangays[array_rand($this->barangays)];
                    $street   = $this->streets[array_rand($this->streets)];
                    $fullAddress = rand(1, 999) . " $street St., $barangay, $city, Metro Manila";

                    $contactNo   = $this->contactPrefixes[array_rand($this->contactPrefixes)] . rand(1000000, 9999999);
                    $emergencyNo = $this->contactPrefixes[array_rand($this->contactPrefixes)] . rand(1000000, 9999999);

                    $emailBase = strtolower(preg_replace('/\s+/', '', $fn) . '.' . preg_replace('/\s+/', '', $ln));
                    $email = $emailBase . rand(100, 999) . '@student.ccs.edu.ph';
                    while (isset($usedEmails[$email])) {
                        $email = $emailBase . rand(100, 9999) . '@student.ccs.edu.ph';
                    }
                    $usedEmails[$email] = true;

                    $guardianFn       = $this->guardianFirstNames[array_rand($this->guardianFirstNames)];
                    $guardianRelation = $this->guardianRelations[array_rand($this->guardianRelations)];
                    $emergencyFn      = $this->emergencyFirstNames[array_rand($this->emergencyFirstNames)];
                    $emergencyRelation = $this->emergencyRelations[array_rand($this->emergencyRelations)];

                    $statusRoll = rand(1, 100);
                    $status = $statusRoll <= 90 ? 'active' : ($statusRoll <= 95 ? 'inactive' : ($statusRoll <= 98 ? 'loa' : 'dropped'));

                    $studentRows[] = [
                        'student_id'               => $sid,
                        'department'               => $dept,
                        'section'                  => $section,
                        'first_name'               => $fn,
                        'middle_name'              => $mn,
                        'last_name'                => $ln,
                        'age'                      => $age,
                        'gender'                   => $gender,
                        'address'                  => $fullAddress,
                        'contact_number'           => $contactNo,
                        'email'                    => $email,
                        'enrollment_date'          => $enrollDates[$yearLevel],
                        'status'                   => $status,
                        'date_of_birth'            => Carbon::now()->subYears($age)->subDays(rand(0, 364))->format('Y-m-d'),
                        'guardian_name'            => "$guardianFn $ln ($guardianRelation)",
                        'emergency_contact_name'   => "$emergencyFn $ln ($emergencyRelation)",
                        'emergency_contact_number' => $emergencyNo,
                        'created_at'               => $this->now,
                        'updated_at'               => $this->now,
                    ];

                    // Store metadata for user + related rows (keyed by student_id string for lookup after bulk insert)
                    $userPayloads[$sid] = [
                        'name'    => "$fn $ln",
                        'email'   => $email,
                        'dept'    => $dept,
                        'yn'      => $yn,
                        'program' => $program,
                    ];
                }

                // Bulk insert students, then fetch their auto-increment IDs
                foreach (array_chunk($studentRows, 50) as $chunk) {
                    DB::table('students')->insert($chunk);
                }

                // Fetch inserted student IDs by student_id codes
                $sids = array_column($studentRows, 'student_id');
                $insertedStudents = DB::table('students')
                    ->whereIn('student_id', $sids)
                    ->pluck('id', 'student_id');

                // Build user rows + related data now that we have real IDs
                $userRows = [];
                foreach ($studentRows as $sr) {
                    $sid      = $sr['student_id'];
                    $dbId     = $insertedStudents[$sid];
                    $meta     = $userPayloads[$sid];

                    $userRows[] = [
                        'name'       => $meta['name'],
                        'email'      => $meta['email'],
                        'password'   => $this->studentHash,
                        'role'       => 'student',
                        'student_id' => $dbId,
                        'created_at' => $this->now,
                        'updated_at' => $this->now,
                    ];

                    // Affiliations
                    $affPicks = collect($this->affiliationPool)->shuffle()->take(rand(1, 3));
                    foreach ($affPicks as [$aname, $atype]) {
                        $affiliationRows[] = [
                            'student_id'  => $dbId,
                            'name'        => $aname,
                            'type'        => $atype,
                            'role'        => 'Member',
                            'date_joined' => Carbon::now()->subMonths(rand(3, 36))->format('Y-m-d'),
                            'created_at'  => $this->now,
                            'updated_at'  => $this->now,
                        ];
                    }

                    // Skills
                    $skillPool  = $meta['dept'] === 'IT' ? $this->itSkillPool : $this->csSkillPool;
                    foreach (collect($skillPool)->shuffle()->take(rand(2, 4)) as [$sname, $level, $cert]) {
                        $skillRows[] = [
                            'student_id'    => $dbId,
                            'skill_name'    => $sname,
                            'skill_level'   => $level,
                            'certification' => $cert,
                            'created_at'    => $this->now,
                            'updated_at'    => $this->now,
                        ];
                    }

                    // Non-academic history
                    foreach (collect($this->activityPool)->shuffle()->take(rand(1, 2)) as [$title, $cat, $desc, $role, $org, $result]) {
                        $start = Carbon::now()->subMonths(rand(6, 30));
                        $historyRows[] = [
                            'student_id'     => $dbId,
                            'activity_title' => $title,
                            'category'       => $cat,
                            'description'    => $desc,
                            'date_started'   => $start->format('Y-m-d'),
                            'date_ended'     => (clone $start)->addDays(rand(1, 5))->format('Y-m-d'),
                            'role'           => $role,
                            'organizer'      => $org,
                            'game_result'    => $result,
                            'created_at'     => $this->now,
                            'updated_at'     => $this->now,
                        ];
                    }

                    // Academic records + grades
                    $yn = $meta['yn'];
                    for ($y = 1; $y <= $yn; $y++) {
                        $sems      = ($y === $yn) ? ['1st'] : ['1st', '2nd'];
                        $sy        = $syMap[$y];
                        $yearLabel = match($y) { 1 => '1st Year', 2 => '2nd Year', 3 => '3rd Year', 4 => '4th Year' };

                        foreach ($sems as $sem) {
                            $semLabel = $sem === '1st' ? '1st Semester' : '2nd Semester';
                            $recordId = DB::table('academic_records')->insertGetId([
                                'student_id'  => $dbId,
                                'school_year' => $sy,
                                'semester'    => $sem,
                                'year_level'  => $y,
                                'gpa'         => null,
                                'created_at'  => $this->now,
                                'updated_at'  => $this->now,
                            ]);

                            $subs     = $subjects->get($meta['program'] . '|' . $yearLabel . '|' . $semLabel, collect());
                            $total    = 0;
                            $subCount = 0;

                            foreach ($subs as $sub) {
                                $score = $this->gradeValues[array_rand($this->gradeValues)];
                                $gradeRows[] = [
                                    'academic_record_id' => $recordId,
                                    'subject_id'         => $sub->id,
                                    'subject_name'       => $sub->subject_name,
                                    'score'              => $score,
                                    'remarks'            => 'Passed',
                                    'created_at'         => $this->now,
                                    'updated_at'         => $this->now,
                                ];
                                $total += $score;
                                $subCount++;
                            }

                            if ($subCount > 0) {
                                $gpaUpdates[$recordId] = round($total / $subCount, 2);
                            }
                        }
                    }

                    // Violations (~40%)
                    if (rand(1, 10) <= 4) {
                        [$vtype, $vdesc, $vsev, $vaction] = $this->violationPool[array_rand($this->violationPool)];
                        $committed = Carbon::now()->subMonths(rand(1, 18));
                        $resolved  = $vsev === 'minor' && rand(0, 1);
                        $violationRows[] = [
                            'student_id'     => $dbId,
                            'violation_type' => $vtype,
                            'description'    => $vdesc,
                            'date_committed' => $committed->format('Y-m-d'),
                            'severity_level' => $vsev,
                            'action_taken'   => $vaction,
                            'is_resolved'    => (int) $resolved,
                            'resolved_at'    => $resolved ? (clone $committed)->addDays(rand(3, 14))->toDateTimeString() : null,
                            'created_at'     => $this->now,
                            'updated_at'     => $this->now,
                        ];
                    }
                }

                // Bulk insert users for this bucket
                foreach (array_chunk($userRows, 50) as $chunk) {
                    DB::table('users')->insert($chunk);
                }

                $generated += 120;
                $this->command->info("  → $yearLevel $dept: 120 students done");

                // Flush related rows every bucket to keep memory low
                $this->flushBulk($affiliationRows, $skillRows, $historyRows, $gradeRows, $violationRows);
                $affiliationRows = $skillRows = $historyRows = $gradeRows = $violationRows = [];
            }
        }

        // Bulk update GPAs using a single CASE statement per batch
        $this->bulkUpdateGpa($gpaUpdates);

        $this->command->info("✓ Total generated: {$generated} students");
    }

    private function flushBulk(array $aff, array $skills, array $history, array $grades, array $violations): void
    {
        foreach (array_chunk($aff, 100) as $chunk)        DB::table('affiliations')->insert($chunk);
        foreach (array_chunk($skills, 100) as $chunk)     DB::table('skills')->insert($chunk);
        foreach (array_chunk($history, 100) as $chunk)    DB::table('non_academic_histories')->insert($chunk);
        foreach (array_chunk($grades, 100) as $chunk)     DB::table('grades')->insert($chunk);
        foreach (array_chunk($violations, 100) as $chunk) DB::table('violations')->insert($chunk);
    }

    private function bulkUpdateGpa(array $gpaUpdates): void
    {
        if (empty($gpaUpdates)) return;

        // Batch CASE updates — much faster than N individual UPDATEs
        foreach (array_chunk($gpaUpdates, 500, true) as $batch) {
            $ids   = array_keys($batch);
            $cases = '';
            foreach ($batch as $id => $gpa) {
                $cases .= "WHEN $id THEN $gpa ";
            }
            $inList = implode(',', $ids);
            DB::statement("UPDATE academic_records SET gpa = CASE id {$cases}END WHERE id IN ($inList)");
        }
    }
}
