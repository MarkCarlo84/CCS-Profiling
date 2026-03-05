<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Department;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $deptIds   = Department::pluck('id')->toArray();
        $studentIds = Student::pluck('id')->toArray();
        $facultyIds = Faculty::pluck('id')->toArray();

        $events = [
            // Curricular
            ['title'=>'CCS Research Symposium 2025',          'type'=>'curricular',     'category'=>'symposium',     'status'=>'completed', 'date_start'=>'2025-11-15', 'date_end'=>'2025-11-15', 'organizer'=>'CCS Research Office',    'venue'=>'CCS Auditorium'],
            ['title'=>'National Programming Contest 2025',     'type'=>'curricular',     'category'=>'competition',   'status'=>'completed', 'date_start'=>'2025-10-20', 'date_end'=>'2025-10-21', 'organizer'=>'ICpEP-SE Region VII',    'venue'=>'USC Main Campus'],
            ['title'=>'IT Capstone Defense — 4th Year 2026',   'type'=>'curricular',     'category'=>'defense',       'status'=>'upcoming',  'date_start'=>'2026-03-20', 'date_end'=>'2026-03-21', 'organizer'=>'CCS Faculty',            'venue'=>'CCS Seminar Rooms'],
            ['title'=>'Web Development Seminar',               'type'=>'curricular',     'category'=>'seminar',       'status'=>'completed', 'date_start'=>'2025-09-10', 'date_end'=>'2025-09-10', 'organizer'=>'Google Developer Student Club','venue'=>'CCS Lab 201'],
            ['title'=>'Cybersecurity Awareness Week',          'type'=>'curricular',     'category'=>'seminar',       'status'=>'completed', 'date_start'=>'2025-10-01', 'date_end'=>'2025-10-05', 'organizer'=>'CCS IT Department',      'venue'=>'Online / Hybrid'],
            ['title'=>'Industrial Visit: Cebu IT Companies',   'type'=>'curricular',     'category'=>'field_trip',    'status'=>'completed', 'date_start'=>'2025-11-28', 'date_end'=>'2025-11-28', 'organizer'=>'CS Faculty',             'venue'=>'Various IT Hubs'],
            ['title'=>'ACM ICPC Regional Training 2026',       'type'=>'curricular',     'category'=>'competition',   'status'=>'ongoing',   'date_start'=>'2026-02-01', 'date_end'=>'2026-03-30', 'organizer'=>'ACM Chapter',            'venue'=>'Computer Lab 201'],
            ['title'=>'Data Science Workshop',                 'type'=>'curricular',     'category'=>'workshop',      'status'=>'upcoming',  'date_start'=>'2026-03-15', 'date_end'=>'2026-03-15', 'organizer'=>'Analytics Club',         'venue'=>'CCS Seminar Room'],
            ['title'=>'Software Dev Bootcamp',                 'type'=>'curricular',     'category'=>'workshop',      'status'=>'upcoming',  'date_start'=>'2026-04-07', 'date_end'=>'2026-04-09', 'organizer'=>'CCS Student Council',    'venue'=>'CCS Labs'],
            ['title'=>'AI/ML Lecture Series',                  'type'=>'curricular',     'category'=>'lecture',       'status'=>'completed', 'date_start'=>'2025-08-25', 'date_end'=>null,          'organizer'=>'CS Faculty',             'venue'=>'CCS Lecture Hall 1'],
            // Extra-Curricular
            ['title'=>'CCS Foundation Week 2025',              'type'=>'extra_curricular','category'=>'cultural',     'status'=>'completed', 'date_start'=>'2025-09-22', 'date_end'=>'2025-09-26', 'organizer'=>'CCS Student Council',    'venue'=>'CCS Campus Area'],
            ['title'=>'Inter-Department Basketball Tournament', 'type'=>'extra_curricular','category'=>'sports',      'status'=>'completed', 'date_start'=>'2025-10-10', 'date_end'=>'2025-10-14', 'organizer'=>'Supreme Student Council', 'venue'=>'University Gymnasium'],
            ['title'=>'Tech Quiz Bee',                         'type'=>'extra_curricular','category'=>'competition',  'status'=>'upcoming',  'date_start'=>'2026-03-22', 'date_end'=>'2026-03-22', 'organizer'=>'JPCS Chapter',           'venue'=>'CCS Auditorium'],
            ['title'=>'Tree Planting Activity',                'type'=>'extra_curricular','category'=>'outreach',     'status'=>'completed', 'date_start'=>'2025-09-18', 'date_end'=>'2025-09-18', 'organizer'=>'CCS SDG Committee',      'venue'=>'Cebu City Forest Park'],
            ['title'=>'Acquaintance Party 2025',               'type'=>'extra_curricular','category'=>'social',       'status'=>'completed', 'date_start'=>'2025-08-30', 'date_end'=>'2025-08-30', 'organizer'=>'CCS Student Officers',   'venue'=>'CCS Outdoor Area'],
            ['title'=>'Faculty-Student Sports Fest',           'type'=>'extra_curricular','category'=>'sports',       'status'=>'upcoming',  'date_start'=>'2026-04-20', 'date_end'=>'2026-04-21', 'organizer'=>'CCS Faculty & SSC',      'venue'=>'CCS Gymnasium'],
            ['title'=>'CCS Leadership Summit 2026',            'type'=>'extra_curricular','category'=>'leadership',   'status'=>'upcoming',  'date_start'=>'2026-02-28', 'date_end'=>'2026-03-01', 'organizer'=>'CCS Student Council',    'venue'=>'Mountain Resort, Cebu'],
            ['title'=>'Career Fair 2025',                      'type'=>'extra_curricular','category'=>'industry',     'status'=>'completed', 'date_start'=>'2025-11-20', 'date_end'=>'2025-11-20', 'organizer'=>'CDEO & CCS',             'venue'=>'University Gymnasium'],
            ['title'=>'Christmas Party and Awards Night',      'type'=>'extra_curricular','category'=>'social',       'status'=>'completed', 'date_start'=>'2025-12-12', 'date_end'=>'2025-12-12', 'organizer'=>'CCS Faculty & Staff',    'venue'=>'CCS Auditorium'],
            ['title'=>'Hackathon: Build for Good 2026',        'type'=>'extra_curricular','category'=>'competition',  'status'=>'upcoming',  'date_start'=>'2026-05-02', 'date_end'=>'2026-05-03', 'organizer'=>'CCS Innovation Hub',     'venue'=>'CCS Building'],
        ];

        foreach ($events as $i => $eventData) {
            $event = Event::create(array_merge($eventData, [
                'department_id' => !empty($deptIds) ? $deptIds[array_rand($deptIds)] : null,
                'description'   => "This event is organized as part of the CCS academic and co-curricular calendar. It aims to develop student skills and foster camaraderie.",
            ]));

            // Add some student participants
            $sampleStudents = !empty($studentIds)
                ? (array) array_slice($studentIds, ($i * 5) % max(1, count($studentIds) - 5), 5)
                : [];

            foreach ($sampleStudents as $sid) {
                EventParticipant::create([
                    'event_id'          => $event->id,
                    'participable_type' => 'App\\Models\\Student',
                    'participable_id'   => $sid,
                    'role'              => 'participant',
                    'award'             => null,
                ]);
            }

            // Add a faculty organizer
            if (!empty($facultyIds)) {
                EventParticipant::create([
                    'event_id'          => $event->id,
                    'participable_type' => 'App\\Models\\Faculty',
                    'participable_id'   => $facultyIds[array_rand($facultyIds)],
                    'role'              => 'organizer',
                ]);
            }
        }
    }
}
