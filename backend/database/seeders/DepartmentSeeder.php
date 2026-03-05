<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'College of Computer Studies', 'code' => 'CCS', 'description' => 'Offers programs in Computer Science, IT, and Information Systems.'],
            ['name' => 'College of Engineering', 'code' => 'CE', 'description' => 'Covers Civil, Electrical, Mechanical, and Electronics Engineering.'],
            ['name' => 'College of Business and Accountancy', 'code' => 'CBA', 'description' => 'Offers Accountancy, Business Administration, and Marketing programs.'],
            ['name' => 'College of Education', 'code' => 'CEDUC', 'description' => 'Prepares students for teaching careers in various disciplines.'],
            ['name' => 'College of Arts and Sciences', 'code' => 'CAS', 'description' => 'Offers humanities, social sciences, and pure sciences programs.'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['code' => $dept['code']], $dept);
        }
    }
}
