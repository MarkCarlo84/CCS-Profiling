<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubjectSeeder extends Seeder
{
    /**
     * Subjects are seeded via migration 2026_04_02_000001_seed_all_subjects.php
     * using updateOrInsert keyed on (subject_code, program) for IT and CS.
     * This seeder is intentionally left as a no-op to avoid duplicates.
     */
    public function run(): void
    {
        $total = DB::table('subjects')->count();
        $it    = DB::table('subjects')->where('program', 'Information Technology')->count();
        $cs    = DB::table('subjects')->where('program', 'Computer Science')->count();

        $this->command->info("✓ Subjects already seeded via migration: {$total} total ({$it} IT, {$cs} CS)");
    }
}
