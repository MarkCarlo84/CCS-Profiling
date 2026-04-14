<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('emergency_contact_name')->nullable()->after('guardian_name');
            $table->string('emergency_contact_number', 30)->nullable()->after('emergency_contact_name');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['emergency_contact_name', 'emergency_contact_number']);
        });
    }
};
