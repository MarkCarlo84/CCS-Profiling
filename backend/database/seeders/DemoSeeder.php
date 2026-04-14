<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Event;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->teacherHash = Hash::make('Teacher1234');

        DB::transaction(function () {
            $this->seedFaculty();
            $this->seedEvents();
        });
        $this->command->info('✓ DemoSeeder complete');
    }

    private string $teacherHash;

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
