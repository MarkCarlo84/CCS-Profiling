<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('faculty_subjects');
        Schema::create('faculty_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained('faculties')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->string('school_year', 20)->nullable();
            $table->string('semester', 10)->nullable();
            $table->timestamps();

            $table->unique(['faculty_id', 'subject_id', 'school_year', 'semester'], 'fs_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_subjects');
    }
};
