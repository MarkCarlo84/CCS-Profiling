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
            $table->index(['status']);
            $table->index(['gender']);
            $table->index(['department']);
            $table->index(['first_name', 'last_name']);
            $table->index(['student_id']);
        });

        // Faculty table indexes
        Schema::table('faculties', function (Blueprint $table) {
            $table->index(['department']);
            $table->index(['first_name', 'last_name']);
            $table->index(['faculty_id']);
        });

        // Academic records indexes
        Schema::table('academic_records', function (Blueprint $table) {
            $table->index(['student_id', 'school_year', 'semester']);
            $table->index(['year_level']);
        });

        // Grades table indexes
        Schema::table('grades', function (Blueprint $table) {
            $table->index(['academic_record_id']);
            $table->index(['subject_id']);
            $table->index(['remarks']);
        });

        // Skills table indexes
        Schema::table('skills', function (Blueprint $table) {
            $table->index(['student_id']);
            $table->index(['skill_name']);
            $table->index(['skill_level']);
            $table->index(['certification']);
        });

        // Affiliations table indexes
        Schema::table('affiliations', function (Blueprint $table) {
            $table->index(['student_id']);
            $table->index(['name']);
            $table->index(['type']);
        });

        // Violations table indexes
        Schema::table('violations', function (Blueprint $table) {
            $table->index(['student_id']);
            $table->index(['severity_level']);
            $table->index(['date_reported']);
        });

        // Faculty evaluations indexes
        Schema::table('faculty_evaluations', function (Blueprint $table) {
            $table->index(['faculty_id']);
            $table->index(['student_id']);
            $table->index(['school_year', 'semester']);
        });

        // Subjects table indexes
        Schema::table('subjects', function (Blueprint $table) {
            $table->index(['year_level', 'semester', 'program']);
            $table->index(['subject_name']);
        });

        // Non-academic histories indexes
        Schema::table('non_academic_histories', function (Blueprint $table) {
            $table->index(['student_id']);
            $table->index(['category']);
            $table->index(['date_participated']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove indexes
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['gender']);
            $table->dropIndex(['department']);
            $table->dropIndex(['first_name', 'last_name']);
            $table->dropIndex(['student_id']);
        });

        Schema::table('faculties', function (Blueprint $table) {
            $table->dropIndex(['department']);
            $table->dropIndex(['first_name', 'last_name']);
            $table->dropIndex(['faculty_id']);
        });

        Schema::table('academic_records', function (Blueprint $table) {
            $table->dropIndex(['student_id', 'school_year', 'semester']);
            $table->dropIndex(['year_level']);
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->dropIndex(['academic_record_id']);
            $table->dropIndex(['subject_id']);
            $table->dropIndex(['remarks']);
        });

        Schema::table('skills', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
            $table->dropIndex(['skill_name']);
            $table->dropIndex(['skill_level']);
            $table->dropIndex(['certification']);
        });

        Schema::table('affiliations', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
            $table->dropIndex(['name']);
            $table->dropIndex(['type']);
        });

        Schema::table('violations', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
            $table->dropIndex(['severity_level']);
            $table->dropIndex(['date_reported']);
        });

        Schema::table('faculty_evaluations', function (Blueprint $table) {
            $table->dropIndex(['faculty_id']);
            $table->dropIndex(['student_id']);
            $table->dropIndex(['school_year', 'semester']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropIndex(['year_level', 'semester', 'program']);
            $table->dropIndex(['subject_name']);
        });

        Schema::table('non_academic_histories', function (Blueprint $table) {
            $table->dropIndex(['student_id']);
            $table->dropIndex(['category']);
            $table->dropIndex(['date_participated']);
        });
    }
};