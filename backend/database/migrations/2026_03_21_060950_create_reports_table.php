<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('report_type')->nullable();   // e.g. Incident, Academic, Behavioral
            $table->string('subject_student')->nullable(); // student name or subject of report
            $table->text('content');
            $table->string('status')->default('draft');  // draft, submitted, reviewed
            $table->date('report_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
