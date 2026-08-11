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
        Schema::create('lawyer_verifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lawyer_profile_id');
            $table->string('status', 20); // pending|needs_fix|approved|rejected
            $table->json('submitted_data')->nullable();
            $table->text('review_note')->nullable();
            $table->uuid('reviewed_by')->nullable();
            $table->dateTime('submitted_at', 6);
            $table->dateTime('reviewed_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['lawyer_profile_id', 'status']);

            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->cascadeOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lawyer_verifications');
    }
};
