<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // grades: speed up lookups by academic_record and subject
        Schema::table('grades', function (Blueprint $table) {
            if (!$this->hasIndex('grades', 'grades_academic_record_id_index')) {
                $table->index('academic_record_id');
            }
            if (!$this->hasIndex('grades', 'grades_subject_id_index')) {
                $table->index('subject_id');
            }
        });

        // academic_records: speed up student lookups
        Schema::table('academic_records', function (Blueprint $table) {
            if (!$this->hasIndex('academic_records', 'academic_records_student_id_index')) {
                $table->index('student_id');
            }
        });

        // students: speed up common filters
        Schema::table('students', function (Blueprint $table) {
            if (!$this->hasIndex('students', 'students_department_status_index')) {
                $table->index(['department', 'status']);
            }
            if (!$this->hasIndex('students', 'students_last_name_index')) {
                $table->index('last_name');
            }
        });

        // schedules: speed up common filters
        Schema::table('schedules', function (Blueprint $table) {
            if (!$this->hasIndex('schedules', 'schedules_faculty_id_index')) {
                $table->index('faculty_id');
            }
            if (!$this->hasIndex('schedules', 'schedules_section_id_index')) {
                $table->index('section_id');
            }
            if (!$this->hasIndex('schedules', 'schedules_semester_school_year_index')) {
                $table->index(['semester', 'school_year']);
            }
        });

        // violations & affiliations: speed up student-based lookups
        Schema::table('violations', function (Blueprint $table) {
            if (!$this->hasIndex('violations', 'violations_student_id_index')) {
                $table->index('student_id');
            }
        });

        Schema::table('affiliations', function (Blueprint $table) {
            if (!$this->hasIndex('affiliations', 'affiliations_student_id_index')) {
                $table->index('student_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropIndex(['academic_record_id']);
            $table->dropIndex(['subject_id']);
        });
        Schema::table('academic_records', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
        });
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex(['department', 'status']);
            $table->dropIndex(['last_name']);
        });
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex(['faculty_id']);
            $table->dropIndex(['section_id']);
            $table->dropIndex(['semester', 'school_year']);
        });
        Schema::table('violations', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
        });
        Schema::table('affiliations', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(\DB::select("SHOW INDEX FROM `$table`"))
            ->pluck('Key_name')
            ->contains($index);
    }
};
