<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_non_academic_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('activity');                  // e.g. Basketball, Programming Contest
            $table->string('category')->nullable();      // e.g. Sports, Academic, Cultural, Leadership
            $table->string('award')->nullable();         // e.g. Champion, 2nd Place, Best Programmer
            $table->enum('level', ['school', 'regional', 'national', 'international'])->default('school');
            $table->date('date_held')->nullable();
            $table->string('school_year', 20)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_non_academic_records');
    }
};
