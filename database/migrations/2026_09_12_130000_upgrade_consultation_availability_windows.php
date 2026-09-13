<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lawyer_availabilities', function (Blueprint $table): void {
            if (! Schema::hasColumn('lawyer_availabilities', 'allowed_durations')) {
                $table->json('allowed_durations')->nullable()->after('ends_at');
            }
        });

        Schema::table('consultations', function (Blueprint $table): void {
            if (! Schema::hasColumn('consultations', 'duration_minutes')) {
                $table->unsignedSmallInteger('duration_minutes')
                    ->nullable()
                    ->after('scheduled_end_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table): void {
            if (Schema::hasColumn('consultations', 'duration_minutes')) {
                $table->dropColumn('duration_minutes');
            }
        });

        Schema::table('lawyer_availabilities', function (Blueprint $table): void {
            if (Schema::hasColumn('lawyer_availabilities', 'allowed_durations')) {
                $table->dropColumn('allowed_durations');
            }
        });
    }
};
