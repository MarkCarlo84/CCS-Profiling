<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add section column if it doesn't already exist
        if (!Schema::hasColumn('faculty_subjects', 'section')) {
            Schema::table('faculty_subjects', function (Blueprint $table) {
                $table->string('section')->nullable()->after('semester');
            });
        }

        // Drop FKs only if they exist — prevents crash on fresh deploy or re-run
        $existingFks = collect(DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'faculty_subjects'
              AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        "))->pluck('CONSTRAINT_NAME')->toArray();

        if (in_array('faculty_subjects_faculty_id_foreign', $existingFks)) {
            DB::statement('ALTER TABLE faculty_subjects DROP FOREIGN KEY faculty_subjects_faculty_id_foreign');
        }
        if (in_array('faculty_subjects_subject_id_foreign', $existingFks)) {
            DB::statement('ALTER TABLE faculty_subjects DROP FOREIGN KEY faculty_subjects_subject_id_foreign');
        }

        // Drop old unique index if it exists
        $existingIndexes = collect(DB::select("
            SELECT INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'faculty_subjects'
              AND INDEX_NAME = 'fs_unique'
        "))->pluck('INDEX_NAME')->toArray();

        if (in_array('fs_unique', $existingIndexes)) {
            DB::statement('ALTER TABLE faculty_subjects DROP INDEX fs_unique');
        }

        DB::statement('ALTER TABLE faculty_subjects ADD UNIQUE KEY fs_unique (faculty_id, subject_id, school_year, semester, section)');
        DB::statement('ALTER TABLE faculty_subjects ADD CONSTRAINT faculty_subjects_faculty_id_foreign FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE faculty_subjects ADD CONSTRAINT faculty_subjects_subject_id_foreign FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE');
    }

    public function down(): void
    {
        Schema::table('faculty_subjects', function (Blueprint $table) {
            $table->dropColumn('section');
        });

        DB::statement('ALTER TABLE faculty_subjects DROP FOREIGN KEY faculty_subjects_faculty_id_foreign');
        DB::statement('ALTER TABLE faculty_subjects DROP FOREIGN KEY faculty_subjects_subject_id_foreign');
        DB::statement('ALTER TABLE faculty_subjects DROP INDEX fs_unique');
        DB::statement('ALTER TABLE faculty_subjects ADD UNIQUE KEY fs_unique (faculty_id, subject_id, school_year, semester)');
        DB::statement('ALTER TABLE faculty_subjects ADD CONSTRAINT faculty_subjects_faculty_id_foreign FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE faculty_subjects ADD CONSTRAINT faculty_subjects_subject_id_foreign FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE');
    }
};
