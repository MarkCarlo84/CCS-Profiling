<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('syllabus_id')->constrained('syllabi')->onDelete('cascade');
            $table->unsignedTinyInteger('week_number');
            $table->string('topic');
            $table->text('learning_objectives')->nullable();
            $table->text('materials')->nullable();
            $table->text('activities')->nullable();
            $table->text('assessment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
