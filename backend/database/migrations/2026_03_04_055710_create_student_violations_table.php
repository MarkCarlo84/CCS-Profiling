<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('violation');                     // e.g. Tardiness, Cheating
            $table->enum('severity', ['minor', 'major', 'grave'])->default('minor');
            $table->date('date_committed');
            $table->string('school_year', 20)->nullable();
            $table->text('description')->nullable();
            $table->string('sanction')->nullable();
            $table->enum('status', ['pending', 'resolved', 'appealed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_violations');
    }
};
