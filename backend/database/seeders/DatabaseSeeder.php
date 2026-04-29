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

        // Skip all heavy seeders only if FULLY seeded (200 students + faculty exist)
        $studentCount = \Illuminate\Support\Facades\DB::table('students')->count();
        $facultyCount = \Illuminate\Support\Facades\DB::table('faculties')->count();

        if ($studentCount >= 200 && $facultyCount >= 15) {
            $this->command->info("✓ Database already fully seeded ({$studentCount} students, {$facultyCount} faculty) — skipping.");
            return;
        }

        // NOTE: If you need to re-seed from scratch, clear the students/faculties tables first

        // Always seed subjects and eligibility criteria (idempotent)
        $this->call(SubjectSeeder::class);
        $this->call(EligibilityCriteriaSeeder::class);

        // Only seed students if not yet fully seeded
        if ($studentCount < 200) {
            $this->call(StudentBulkSeeder::class);
        } else {
            $this->command->info("✓ Students already seeded ({$studentCount} found) — skipping StudentBulkSeeder.");
        }

        // Only seed faculty if not yet seeded
        if ($facultyCount < 15) {
            $this->call(DemoSeeder::class);
        } else {
            $this->command->info("✓ Faculty already seeded ({$facultyCount} found) — skipping DemoSeeder.");
        }

        $this->call(FacultyReportsSeeder::class);
        $this->call(FacultyEvaluationsSeeder::class);
    }
}
