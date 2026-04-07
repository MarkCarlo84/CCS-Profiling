<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL requires re-declaring the full enum to add a new value
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('active','inactive','graduated','dropped','loa') NOT NULL DEFAULT 'active'");
    }

    public function down(): void
    {
        // Revert any 'loa' rows back to 'inactive' before removing the value
        DB::statement("UPDATE students SET status = 'inactive' WHERE status = 'loa'");
        DB::statement("ALTER TABLE students MODIFY COLUMN status ENUM('active','inactive','graduated','dropped') NOT NULL DEFAULT 'active'");
    }
};
