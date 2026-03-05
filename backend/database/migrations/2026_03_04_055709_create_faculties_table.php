<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('employee_number', 50)->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('position');          // e.g. Instructor I, Professor III
            $table->enum('employment_type', ['full_time', 'part_time', 'contractual'])->default('full_time');
            $table->string('specialization')->nullable();
            $table->string('highest_education')->nullable(); // BS CS, MSIT, PhD
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->date('date_hired')->nullable();
            $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculties');
    }
};
