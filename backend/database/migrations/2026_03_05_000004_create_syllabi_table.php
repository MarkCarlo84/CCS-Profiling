<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('syllabi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained('curricula')->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->onDelete('set null');
            $table->enum('semester', ['1st', '2nd', 'summer'])->default('1st');
            $table->string('school_year', 20);  // e.g. 2025-2026
            $table->text('course_description')->nullable();
            $table->text('objectives')->nullable();
            $table->text('references')->nullable();
            $table->enum('status', ['draft', 'approved', 'archived'])->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('syllabi');
    }
};
