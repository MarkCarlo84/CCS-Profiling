<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('subjects', 'program')) {
            Schema::table('subjects', function (Blueprint $table) {
                $table->string('program', 100)->nullable()->after('semester');
            });
        }
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn('program');
        });
    }
};
