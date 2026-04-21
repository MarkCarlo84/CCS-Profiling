<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->index('status');
            $table->index('department');
            $table->index('gender');
            $table->index('last_name');
        });

        Schema::table('faculties', function (Blueprint $table) {
            $table->index('department');
            $table->index('last_name');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->index(['faculty_id', 'semester', 'school_year']);
            $table->index(['section_id', 'semester', 'school_year']);
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['department']);
            $table->dropIndex(['gender']);
            $table->dropIndex(['last_name']);
        });

        Schema::table('faculties', function (Blueprint $table) {
            $table->dropIndex(['department']);
            $table->dropIndex(['last_name']);
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex(['faculty_id', 'semester', 'school_year']);
            $table->dropIndex(['section_id', 'semester', 'school_year']);
        });
    }
};
