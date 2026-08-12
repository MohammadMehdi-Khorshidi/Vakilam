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
        Schema::create('consultations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('legal_request_id');
            $table->uuid('client_user_id');
            $table->uuid('lawyer_profile_id')->nullable();
            $table->string('status', 20)->default('requested'); // requested|scheduled|in_progress|completed|cancelled|no_show
            $table->dateTime('scheduled_start_at', 6)->nullable();
            $table->dateTime('scheduled_end_at', 6)->nullable();
            $table->dateTime('completed_at', 6)->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->index(['lawyer_profile_id', 'scheduled_start_at']);
            $table->index(['client_user_id', 'status']);

            $table->foreign('legal_request_id')->references('id')->on('legal_requests')->restrictOnDelete();
            $table->foreign('client_user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
