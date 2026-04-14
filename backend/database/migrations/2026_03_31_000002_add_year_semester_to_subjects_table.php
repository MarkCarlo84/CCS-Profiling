<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            if (!Schema::hasColumn('subjects', 'year_level')) {
                $table->string('year_level', 50)->nullable()->after('units');
            }
            if (!Schema::hasColumn('subjects', 'semester')) {
                $table->string('semester', 50)->nullable()->after('year_level');
            }
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn(['year_level', 'semester']);
        });
    }
};
