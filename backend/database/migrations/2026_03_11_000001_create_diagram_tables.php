<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('subjects');
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('subject_code', 30)->unique();
            $table->string('subject_name');
            $table->integer('units')->default(3);
            $table->string('pre_requisite')->nullable();
            $table->timestamps();
        });

        Schema::dropIfExists('grades');
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_record_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->nullable()->constrained()->onDelete('set null');
            $table->string('subject_name')->nullable();
            $table->decimal('score', 4, 2)->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();
        });

        Schema::dropIfExists('eligibility_criteria');
        Schema::create('eligibility_criteria', function (Blueprint $table) {
            $table->id();
            $table->string('criteria_id')->nullable();
            $table->decimal('minimum_gpa', 4, 2)->default(3.00);
            $table->string('required_skill')->nullable();
            $table->string('required_affiliation_type')->nullable();
            $table->integer('max_allowed_violations')->default(0);
            $table->timestamps();
        });

        // Affiliations (replaces student_affiliations)
        Schema::dropIfExists('affiliations');
        Schema::create('affiliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('name');            // organization name
            $table->string('type')->nullable(); // e.g. academic, sports, government
            $table->string('role')->nullable();
            $table->date('date_joined')->nullable();
            $table->timestamps();
        });

        // Violations (replaces student_violations)
        Schema::dropIfExists('violations');
        Schema::create('violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('violation_type');
            $table->text('description')->nullable();
            $table->date('date_committed')->nullable();
            $table->string('severity_level')->default('minor'); // minor, major, grave
            $table->text('action_taken')->nullable();
            $table->timestamps();
        });

        // Academic Records (replaces student_academic_records)
        Schema::dropIfExists('academic_records');
        Schema::create('academic_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('school_year', 20);
            $table->string('semester', 30)->nullable(); // 1st Semester, 2nd Semester
            $table->decimal('gpa', 4, 2)->nullable();
            $table->timestamps();
        });

        // Skills (replaces student_skills)
        Schema::dropIfExists('skills');
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('skill_name');
            $table->string('skill_level')->default('beginner'); // beginner, intermediate, advanced, expert
            $table->boolean('certification')->default(false);
            $table->timestamps();
        });

        // Non-Academic Histories (replaces student_non_academic_records)
        Schema::dropIfExists('non_academic_histories');
        Schema::create('non_academic_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('activity_title');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->date('date_started')->nullable();
            $table->date('date_ended')->nullable();
            $table->string('role')->nullable();
            $table->string('organizer')->nullable();
            $table->string('game_result')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('non_academic_histories');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('academic_records');
        Schema::dropIfExists('violations');
        Schema::dropIfExists('affiliations');
        Schema::dropIfExists('eligibility_criteria');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('subjects');
    }
};
