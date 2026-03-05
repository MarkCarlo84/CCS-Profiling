<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('building');
            $table->string('room_number', 20);
            $table->string('name')->nullable();
            $table->enum('type', ['classroom', 'lab', 'lecture_hall', 'seminar_room'])->default('classroom');
            $table->unsignedSmallInteger('capacity')->default(40);
            $table->boolean('is_available')->default(true);
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['building', 'room_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
