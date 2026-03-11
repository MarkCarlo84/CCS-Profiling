<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,     // admin@ccs.edu.ph / admin1234
            FacultySeeder::class,  // creates faculties
            StudentSeeder::class,  // creates students + all related data
        ]);
    }
}
