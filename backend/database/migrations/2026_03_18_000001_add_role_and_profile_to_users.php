<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'teacher', 'student'])->default('admin')->after('email');
            $table->unsignedBigInteger('faculty_id')->nullable()->after('role');
            $table->unsignedBigInteger('student_id')->nullable()->after('faculty_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'faculty_id', 'student_id']);
        });
    }
};
