<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'max_participants')) {
                $table->unsignedInteger('max_participants')->nullable()->after('department_id');
            }
        });

        // Seed CS and IT departments if they don't exist
        $departments = [
            ['code' => 'CS',  'name' => 'Computer Science',      'description' => 'Bachelor of Science in Computer Science', 'is_active' => true],
            ['code' => 'IT',  'name' => 'Information Technology', 'description' => 'Bachelor of Science in Information Technology', 'is_active' => true],
        ];

        foreach ($departments as $dept) {
            DB::table('departments')->updateOrInsert(
                ['code' => $dept['code']],
                array_merge($dept, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('max_participants');
        });
    }
};
