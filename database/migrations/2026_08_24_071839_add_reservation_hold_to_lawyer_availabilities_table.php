<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lawyer_availabilities', function (Blueprint $table) {
            $table->dateTime('reserved_until', 6)
                ->nullable()
                ->after('status');

            $table->index(
                ['status', 'reserved_until'],
                'idx_slots_status_reserved_until'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lawyer_availabilities', function (Blueprint $table) {
            $table->dropIndex('idx_slots_status_reserved_until');
            $table->dropColumn('reserved_until');
        });
    }
};