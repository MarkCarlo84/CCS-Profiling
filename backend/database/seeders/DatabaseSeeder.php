<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Reserve admin account
        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@ccs.edu.ph')],
            [
                'name'     => 'CCS Admin',
                'password' => Hash::make('Admin1234'),
                'role'     => 'admin',
            ]
        );

        $this->command->info('✓ Admin user ready');

        // Skip all heavy seeders if data already exists
        $studentCount = \Illuminate\Support\Facades\DB::table('students')->count();
        if ($studentCount >= 100) {
            $this->command->info("✓ Database already seeded ({$studentCount} students found) — skipping.");
            return;
        }

        $this->call(SubjectSeeder::class);
        $this->call(EligibilityCriteriaSeeder::class);
        $this->call(StudentBulkSeeder::class);
        $this->call(DemoSeeder::class);
        $this->call(FacultyReportsSeeder::class);
        $this->call(FacultyEvaluationsSeeder::class);
    }
}
