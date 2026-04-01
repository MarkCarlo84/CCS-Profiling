<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_periods', function (Blueprint $table) {
            $table->id();
            $table->string('school_year', 20);          // e.g. 2025-2026
            $table->enum('semester', ['1st', '2nd']);   // only 2 semesters
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        // Seed the current active period
        DB::table('academic_periods')->insert([
            'school_year' => '2025-2026',
            'semester'    => '2nd',
            'is_active'   => true,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_periods');
    }
};
