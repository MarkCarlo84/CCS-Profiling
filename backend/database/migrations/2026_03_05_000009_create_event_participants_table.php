<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->morphs('participable');   // participable_type + participable_id
            $table->enum('role', ['participant', 'organizer', 'judge', 'facilitator'])->default('participant');
            $table->string('award')->nullable();    // e.g. 1st Place, Best in Presentation
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_participants');
    }
};
