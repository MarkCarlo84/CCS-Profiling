<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Remove subjects seeded with legacy program names (BSIT / BSCS)
        // that were created before the program names were standardised to
        // 'Information Technology' and 'Computer Science'.
        DB::table('subjects')->whereIn('program', ['BSIT', 'BSCS'])->delete();
    }

    public function down(): void
    {
        // Nothing to reverse — the legacy rows should not come back.
    }
};
