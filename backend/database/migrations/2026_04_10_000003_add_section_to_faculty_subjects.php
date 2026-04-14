<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Column already exists from partial first run — just rebuild the unique index
        DB::statement('ALTER TABLE faculty_subjects DROP FOREIGN KEY faculty_subjects_faculty_id_foreign');
        DB::statement('ALTER TABLE faculty_subjects DROP FOREIGN KEY faculty_subjects_subject_id_foreign');
        DB::statement('ALTER TABLE faculty_subjects DROP INDEX fs_unique');
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
