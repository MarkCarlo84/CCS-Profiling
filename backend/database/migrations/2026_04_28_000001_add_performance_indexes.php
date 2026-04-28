<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes for frequently queried columns
        
        // Students table indexes
        Schema::table('students', function (Blueprint $table) {
            if (!$this->hasIndex('students', 'students_status_index')) {
                $table->index(['status']);
            }
            if (!$this->hasIndex('students', 'students_gender_index')) {
                $table->index(['gender']);
            }
            if (!$this->hasIndex('students', 'students_department_index')) {
                $table->index(['department']);
            }
            if (!$this->hasIndex('students', 'students_first_name_last_name_index')) {
                $table->index(['first_name', 'last_name']);
            }
            if (!$this->hasIndex('students', 'students_student_id_index')) {
                $table->index(['student_id']);
            }
        });

        // Faculty table indexes
        Schema::table('faculties', function (Blueprint $table) {
            if (!$this->hasIndex('faculties', 'faculties_department_index')) {
                $table->index(['department']);
            }
            if (!$this->hasIndex('faculties', 'faculties_first_name_last_name_index')) {
                $table->index(['first_name', 'last_name']);
            }
            if (!$this->hasIndex('faculties', 'faculties_faculty_id_index')) {
                $table->index(['faculty_id']);
            }
        });

        // Academic records indexes
        Schema::table('academic_records', function (Blueprint $table) {
            if (!$this->hasIndex('academic_records', 'academic_records_student_id_school_year_semester_index')) {
                $table->index(['student_id', 'school_year', 'semester']);
            }
            if (!$this->hasIndex('academic_records', 'academic_records_year_level_index')) {
                $table->index(['year_level']);
            }
        });

        // Grades table indexes
        Schema::table('grades', function (Blueprint $table) {
            if (!$this->hasIndex('grades', 'grades_academic_record_id_index')) {
                $table->index(['academic_record_id']);
            }
            if (!$this->hasIndex('grades', 'grades_subject_id_index')) {
                $table->index(['subject_id']);
            }
            if (!$this->hasIndex('grades', 'grades_remarks_index')) {
                $table->index(['remarks']);
            }
        });

        // Skills table indexes
        Schema::table('skills', function (Blueprint $table) {
            if (!$this->hasIndex('skills', 'skills_student_id_index')) {
                $table->index(['student_id']);
            }
            if (!$this->hasIndex('skills', 'skills_skill_name_index')) {
                $table->index(['skill_name']);
            }
            if (!$this->hasIndex('skills', 'skills_skill_level_index')) {
                $table->index(['skill_level']);
            }
            if (!$this->hasIndex('skills', 'skills_certification_index')) {
                $table->index(['certification']);
            }
        });

        // Affiliations table indexes
        Schema::table('affiliations', function (Blueprint $table) {
            if (!$this->hasIndex('affiliations', 'affiliations_student_id_index')) {
                $table->index(['student_id']);
            }
            if (!$this->hasIndex('affiliations', 'affiliations_name_index')) {
                $table->index(['name']);
            }
            if (!$this->hasIndex('affiliations', 'affiliations_type_index')) {
                $table->index(['type']);
            }
        });

        // Violations table indexes
        Schema::table('violations', function (Blueprint $table) {
            if (!$this->hasIndex('violations', 'violations_student_id_index')) {
                $table->index(['student_id']);
            }
            if (!$this->hasIndex('violations', 'violations_severity_level_index')) {
                $table->index(['severity_level']);
            }
            if (!$this->hasIndex('violations', 'violations_date_committed_index')) {
                $table->index(['date_committed']);
            }
        });

        // Faculty evaluations indexes
        Schema::table('faculty_evaluations', function (Blueprint $table) {
            if (!$this->hasIndex('faculty_evaluations', 'faculty_evaluations_faculty_id_index')) {
                $table->index(['faculty_id']);
            }
            if (!$this->hasIndex('faculty_evaluations', 'faculty_evaluations_student_id_index')) {
                $table->index(['student_id']);
            }
            if (!$this->hasIndex('faculty_evaluations', 'faculty_evaluations_school_year_semester_index')) {
                $table->index(['school_year', 'semester']);
            }
        });

        // Subjects table indexes
        Schema::table('subjects', function (Blueprint $table) {
            if (!$this->hasIndex('subjects', 'subjects_year_level_semester_program_index')) {
                $table->index(['year_level', 'semester', 'program']);
            }
            if (!$this->hasIndex('subjects', 'subjects_subject_name_index')) {
                $table->index(['subject_name']);
            }
        });

        // Non-academic histories indexes
        Schema::table('non_academic_histories', function (Blueprint $table) {
            if (!$this->hasIndex('non_academic_histories', 'non_academic_histories_student_id_index')) {
                $table->index(['student_id']);
            }
            if (!$this->hasIndex('non_academic_histories', 'non_academic_histories_category_index')) {
                $table->index(['category']);
            }
            if (!$this->hasIndex('non_academic_histories', 'non_academic_histories_date_started_index')) {
                $table->index(['date_started']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove indexes (only if they exist)
        Schema::table('students', function (Blueprint $table) {
            if ($this->hasIndex('students', 'students_status_index')) {
                $table->dropIndex(['status']);
            }
            if ($this->hasIndex('students', 'students_gender_index')) {
                $table->dropIndex(['gender']);
            }
            if ($this->hasIndex('students', 'students_department_index')) {
                $table->dropIndex(['department']);
            }
            if ($this->hasIndex('students', 'students_first_name_last_name_index')) {
                $table->dropIndex(['first_name', 'last_name']);
            }
            if ($this->hasIndex('students', 'students_student_id_index')) {
                $table->dropIndex(['student_id']);
            }
        });

        Schema::table('faculties', function (Blueprint $table) {
            if ($this->hasIndex('faculties', 'faculties_department_index')) {
                $table->dropIndex(['department']);
            }
            if ($this->hasIndex('faculties', 'faculties_first_name_last_name_index')) {
                $table->dropIndex(['first_name', 'last_name']);
            }
            if ($this->hasIndex('faculties', 'faculties_faculty_id_index')) {
                $table->dropIndex(['faculty_id']);
            }
        });

        Schema::table('academic_records', function (Blueprint $table) {
            if ($this->hasIndex('academic_records', 'academic_records_student_id_school_year_semester_index')) {
                $table->dropIndex(['student_id', 'school_year', 'semester']);
            }
            if ($this->hasIndex('academic_records', 'academic_records_year_level_index')) {
                $table->dropIndex(['year_level']);
            }
        });

        Schema::table('grades', function (Blueprint $table) {
            if ($this->hasIndex('grades', 'grades_academic_record_id_index')) {
                $table->dropIndex(['academic_record_id']);
            }
            if ($this->hasIndex('grades', 'grades_subject_id_index')) {
                $table->dropIndex(['subject_id']);
            }
            if ($this->hasIndex('grades', 'grades_remarks_index')) {
                $table->dropIndex(['remarks']);
            }
        });

        Schema::table('skills', function (Blueprint $table) {
            if ($this->hasIndex('skills', 'skills_student_id_index')) {
                $table->dropIndex(['student_id']);
            }
            if ($this->hasIndex('skills', 'skills_skill_name_index')) {
                $table->dropIndex(['skill_name']);
            }
            if ($this->hasIndex('skills', 'skills_skill_level_index')) {
                $table->dropIndex(['skill_level']);
            }
            if ($this->hasIndex('skills', 'skills_certification_index')) {
                $table->dropIndex(['certification']);
            }
        });

        Schema::table('affiliations', function (Blueprint $table) {
            if ($this->hasIndex('affiliations', 'affiliations_student_id_index')) {
                $table->dropIndex(['student_id']);
            }
            if ($this->hasIndex('affiliations', 'affiliations_name_index')) {
                $table->dropIndex(['name']);
            }
            if ($this->hasIndex('affiliations', 'affiliations_type_index')) {
                $table->dropIndex(['type']);
            }
        });

        Schema::table('violations', function (Blueprint $table) {
            if ($this->hasIndex('violations', 'violations_student_id_index')) {
                $table->dropIndex(['student_id']);
            }
            if ($this->hasIndex('violations', 'violations_severity_level_index')) {
                $table->dropIndex(['severity_level']);
            }
            if ($this->hasIndex('violations', 'violations_date_committed_index')) {
                $table->dropIndex(['date_committed']);
            }
        });

        Schema::table('faculty_evaluations', function (Blueprint $table) {
            if ($this->hasIndex('faculty_evaluations', 'faculty_evaluations_faculty_id_index')) {
                $table->dropIndex(['faculty_id']);
            }
            if ($this->hasIndex('faculty_evaluations', 'faculty_evaluations_student_id_index')) {
                $table->dropIndex(['student_id']);
            }
            if ($this->hasIndex('faculty_evaluations', 'faculty_evaluations_school_year_semester_index')) {
                $table->dropIndex(['school_year', 'semester']);
            }
        });

        Schema::table('subjects', function (Blueprint $table) {
            if ($this->hasIndex('subjects', 'subjects_year_level_semester_program_index')) {
                $table->dropIndex(['year_level', 'semester', 'program']);
            }
            if ($this->hasIndex('subjects', 'subjects_subject_name_index')) {
                $table->dropIndex(['subject_name']);
            }
        });

        Schema::table('non_academic_histories', function (Blueprint $table) {
            if ($this->hasIndex('non_academic_histories', 'non_academic_histories_student_id_index')) {
                $table->dropIndex(['student_id']);
            }
            if ($this->hasIndex('non_academic_histories', 'non_academic_histories_category_index')) {
                $table->dropIndex(['category']);
            }
            if ($this->hasIndex('non_academic_histories', 'non_academic_histories_date_started_index')) {
                $table->dropIndex(['date_started']);
            }
        });
    }

    /**
     * Check if an index exists on a table
     */
    private function hasIndex(string $table, string $index): bool
    {
        return collect(\DB::select("SHOW INDEX FROM `$table`"))
            ->pluck('Key_name')
            ->contains($index);
    }
};