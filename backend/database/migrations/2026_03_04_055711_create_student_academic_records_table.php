<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_academic_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('subject_code', 30);
            $table->string('subject_name');
            $table->decimal('grade', 4, 2)->nullable();      // e.g. 1.25, 2.00
            $table->decimal('units', 3, 1)->default(3);
            $table->enum('semester', ['1st Semester', '2nd Semester', 'Summer'])->default('1st Semester');
            $table->string('school_year', 20);               // e.g. 2024-2025
            $table->enum('year_level', ['1st Year', '2nd Year', '3rd Year', '4th Year']);
            $table->enum('status', ['passed', 'failed', 'incomplete', 'dropped'])->default('passed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_academic_records');
    }
};
