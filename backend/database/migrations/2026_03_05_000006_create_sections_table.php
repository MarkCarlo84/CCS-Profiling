<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('name', 50);         // e.g. CS301-A
            $table->unsignedTinyInteger('year_level');
            $table->enum('semester', ['1st', '2nd', 'summer'])->default('1st');
            $table->string('school_year', 20);    // e.g. 2025-2026
            $table->unsignedSmallInteger('max_students')->default(40);
            $table->unsignedSmallInteger('enrolled_count')->default(0);
            $table->timestamps();

            $table->unique(['course_id', 'name', 'school_year', 'semester']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
