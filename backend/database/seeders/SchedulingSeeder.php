<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Section;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Faculty;

class SchedulingSeeder extends Seeder
{
    public function run(): void
    {
        // ── Rooms ─────────────────────────────────────────────────────────────
        $rooms = [
            ['building' => 'CCS Building', 'room_number' => '101', 'name' => 'Lecture Hall 1',  'type' => 'lecture_hall', 'capacity' => 60],
            ['building' => 'CCS Building', 'room_number' => '102', 'name' => 'Lecture Hall 2',  'type' => 'lecture_hall', 'capacity' => 60],
            ['building' => 'CCS Building', 'room_number' => '201', 'name' => 'Computer Lab 1',  'type' => 'lab',          'capacity' => 40],
            ['building' => 'CCS Building', 'room_number' => '202', 'name' => 'Computer Lab 2',  'type' => 'lab',          'capacity' => 40],
            ['building' => 'CCS Building', 'room_number' => '203', 'name' => 'Computer Lab 3',  'type' => 'lab',          'capacity' => 40],
            ['building' => 'CCS Building', 'room_number' => '301', 'name' => 'Network Lab',     'type' => 'lab',          'capacity' => 30],
            ['building' => 'CCS Building', 'room_number' => '302', 'name' => 'Seminar Room A',  'type' => 'seminar_room', 'capacity' => 25],
            ['building' => 'Main Building','room_number' => '101', 'name' => 'Classroom 101',   'type' => 'classroom',    'capacity' => 50],
            ['building' => 'Main Building','room_number' => '102', 'name' => 'Classroom 102',   'type' => 'classroom',    'capacity' => 50],
            ['building' => 'Main Building','room_number' => '201', 'name' => 'Classroom 201',   'type' => 'classroom',    'capacity' => 45],
            ['building' => 'Main Building','room_number' => '202', 'name' => 'Classroom 202',   'type' => 'classroom',    'capacity' => 45],
            ['building' => 'Annex',        'room_number' => 'A01', 'name' => 'Annex Lab 1',     'type' => 'lab',          'capacity' => 35],
            ['building' => 'Annex',        'room_number' => 'A02', 'name' => 'Annex Seminar',   'type' => 'seminar_room', 'capacity' => 20],
        ];

        foreach ($rooms as $r) {
            Room::firstOrCreate(
                ['building' => $r['building'], 'room_number' => $r['room_number']],
                array_merge($r, ['is_available' => true])
            );
        }

        // ── Sections ──────────────────────────────────────────────────────────
        $courses    = Course::all();
        $faculties  = Faculty::pluck('id')->toArray();
        $allRooms   = Room::pluck('id')->toArray();
        $days       = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $timeslots  = [
            ['07:00', '08:30'], ['08:30', '10:00'], ['10:00', '11:30'],
            ['11:30', '13:00'], ['13:00', '14:30'], ['14:30', '16:00'], ['16:00', '17:30'],
        ];
        $schoolYear = '2025-2026';
        $semester   = '2nd';

        $slotIndex = 0;
        $dayIndex  = 0;

        foreach ($courses->take(10) as $course) {
            foreach (['A', 'B'] as $sec) {
                $section = Section::firstOrCreate(
                    ['course_id' => $course->id, 'name' => "{$course->code}-{$sec}", 'school_year' => $schoolYear, 'semester' => $semester],
                    [
                        'year_level'     => random_int(1, 4),
                        'max_students'   => 40,
                        'enrolled_count' => random_int(20, 40),
                    ]
                );

                // Assign a schedule slot
                [$ts, $te] = $timeslots[$slotIndex % count($timeslots)];
                $day = $days[$dayIndex % count($days)];

                Schedule::firstOrCreate(
                    ['section_id' => $section->id, 'day_of_week' => $day, 'semester' => $semester, 'school_year' => $schoolYear],
                    [
                        'faculty_id'  => $faculties ? $faculties[array_rand($faculties)] : null,
                        'room_id'     => $allRooms ? $allRooms[array_rand($allRooms)] : null,
                        'time_start'  => $ts,
                        'time_end'    => $te,
                    ]
                );

                $slotIndex++;
                $dayIndex++;
            }
        }
    }
}
