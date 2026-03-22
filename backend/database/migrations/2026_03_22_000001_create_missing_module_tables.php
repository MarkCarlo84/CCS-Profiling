<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Departments ───────────────────────────────────────────────────────
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Courses ───────────────────────────────────────────────────────────
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('code', 20)->unique();
            $table->string('name', 200);
            $table->integer('units')->default(3);
            $table->integer('hours_per_week')->default(3);
            $table->enum('type', ['lecture', 'lab', 'both'])->default('lecture');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Sections ──────────────────────────────────────────────────────────
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('name', 50);
            $table->integer('year_level');
            $table->enum('semester', ['1st', '2nd', 'summer']);
            $table->string('school_year', 20);
            $table->integer('max_students')->default(40);
            $table->integer('enrolled_count')->default(0);
            $table->timestamps();
        });

        // ── Rooms ─────────────────────────────────────────────────────────────
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('building', 100);
            $table->string('room_number', 20);
            $table->string('name', 100)->nullable();
            $table->enum('type', ['classroom', 'lab', 'lecture_hall', 'seminar_room'])->default('classroom');
            $table->integer('capacity')->default(40);
            $table->boolean('is_available')->default(true);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // ── Schedules ─────────────────────────────────────────────────────────
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->onDelete('set null');
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('day_of_week', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
            $table->time('time_start');
            $table->time('time_end');
            $table->enum('semester', ['1st', '2nd', 'summer']);
            $table->string('school_year', 20);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        // ── Curricula ─────────────────────────────────────────────────────────
        Schema::create('curricula', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('code', 30)->unique();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->integer('year_implemented');
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->timestamps();
        });

        // ── Syllabi ───────────────────────────────────────────────────────────
        Schema::create('syllabi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained('curricula')->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->onDelete('set null');
            $table->enum('semester', ['1st', '2nd', 'summer']);
            $table->string('school_year', 20);
            $table->text('course_description')->nullable();
            $table->text('objectives')->nullable();
            $table->text('references')->nullable();
            $table->enum('status', ['draft', 'approved', 'archived'])->default('draft');
            $table->timestamps();
        });

        // ── Lessons ───────────────────────────────────────────────────────────
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('syllabus_id')->constrained('syllabi')->onDelete('cascade');
            $table->integer('week_number');
            $table->string('topic', 255);
            $table->text('learning_objectives')->nullable();
            $table->text('materials')->nullable();
            $table->text('activities')->nullable();
            $table->text('assessment')->nullable();
            $table->timestamps();
        });

        // ── Events ────────────────────────────────────────────────────────────
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->enum('type', ['curricular', 'extra_curricular']);
            $table->string('category', 100);
            $table->string('organizer', 150)->nullable();
            $table->string('venue', 200)->nullable();
            $table->date('date_start');
            $table->date('date_end')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });

        // ── Event Participants (polymorphic: Student | Faculty) ───────────────
        Schema::create('event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->morphs('participable'); // participable_type + participable_id
            $table->enum('role', ['participant', 'organizer', 'judge', 'facilitator'])->default('participant');
            $table->string('award', 150)->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_participants');
        Schema::dropIfExists('events');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('syllabi');
        Schema::dropIfExists('curricula');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('departments');
    }
};
