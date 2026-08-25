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
        Schema::create('lawyer_availabilities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lawyer_profile_id');
            $table->dateTime('starts_at', 6);
            $table->dateTime('ends_at', 6);
            $table->string('status', 20)->default('open');
            $table->dateTime('reserved_until', 6)->nullable();
            $table->uuid('consultation_id')->nullable();
            $table->uuid('meeting_id')->nullable();
            $table->string('note', 255)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->index(['lawyer_profile_id', 'status', 'starts_at'], 'idx_slots_lawyer_status_start');
            $table->index(['lawyer_profile_id', 'starts_at', 'ends_at'], 'idx_slots_lawyer_range');
            $table->index(['status', 'reserved_until'], 'idx_slots_reserved_until');

            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->cascadeOnDelete();
            $table->foreign('consultation_id')->references('id')->on('consultations')->nullOnDelete();
            $table->foreign('meeting_id')->references('id')->on('meetings')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lawyer_availabilities');
    }
};
