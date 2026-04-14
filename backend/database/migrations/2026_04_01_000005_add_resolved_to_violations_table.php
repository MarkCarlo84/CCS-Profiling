<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('violations', function (Blueprint $table) {
            if (!Schema::hasColumn('violations', 'is_resolved')) {
                $table->boolean('is_resolved')->default(false)->after('action_taken');
            }
            if (!Schema::hasColumn('violations', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable()->after('is_resolved');
            }
        });
    }

    public function down(): void
    {
        Schema::table('violations', function (Blueprint $table) {
            $table->dropColumn(['is_resolved', 'resolved_at']);
        });
    }
};
