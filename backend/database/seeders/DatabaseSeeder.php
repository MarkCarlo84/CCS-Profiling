<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DepartmentSeeder::class,
            FacultySeeder::class,
            StudentSeeder::class,
            InstructionSeeder::class,   // creates courses + curricula + syllabi + lessons
            SchedulingSeeder::class,    // creates rooms + sections + schedules (depends on courses + faculties)
            EventSeeder::class,         // creates events + participants (depends on students + faculties)
        ]);
    }
}
