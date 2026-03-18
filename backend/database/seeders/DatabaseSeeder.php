<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            FacultySeeder::class,  // creates faculties first
            StudentSeeder::class,  // creates students + all related data
            UserSeeder::class,     // links user accounts to faculty/student records
        ]);
    }
}
