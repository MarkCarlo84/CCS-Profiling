<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            // Ratings 1–5 per category
            $table->unsignedTinyInteger('teaching_effectiveness')->nullable();
            $table->unsignedTinyInteger('communication')->nullable();
            $table->unsignedTinyInteger('professionalism')->nullable();
            $table->unsignedTinyInteger('subject_mastery')->nullable();
            $table->unsignedTinyInteger('student_engagement')->nullable();
            $table->text('comments')->nullable();
            $table->string('school_year')->nullable();
            $table->string('semester')->nullable();
            $table->timestamps();
            // One evaluation per student per faculty per semester
            $table->unique(['faculty_id', 'student_id', 'school_year', 'semester'], 'fe_unique_per_semester');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_evaluations');
    }
};
