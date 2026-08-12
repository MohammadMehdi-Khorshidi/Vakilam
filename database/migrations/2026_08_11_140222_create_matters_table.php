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
        Schema::create('legal_matters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('source_legal_request_id');
            $table->uuid('engagement_id')->nullable();
            $table->uuid('client_user_id');
            $table->string('title', 200);
            $table->string('status', 20)->default('onboarding'); // onboarding|active|stayed|completed|closed
            $table->dateTime('opened_at', 6)->nullable();
            $table->dateTime('closed_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->index(['client_user_id', 'status', 'updated_at']);

            $table->foreign('source_legal_request_id')->references('id')->on('legal_requests')->restrictOnDelete();
            $table->foreign('engagement_id')->references('id')->on('engagements')->nullOnDelete();
            $table->foreign('client_user_id')->references('id')->on('users')->restrictOnDelete();
        });

        Schema::create('matter_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_matter_id');
            $table->uuid('user_id');
            $table->string('member_role', 30); // client|lawyer|assistant
            $table->dateTime('joined_at', 6);
            $table->dateTime('revoked_at', 6)->nullable();

            $table->unique(['legal_matter_id', 'user_id']);
            $table->index('user_id');

            $table->foreign('legal_matter_id')->references('id')->on('legal_matters')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('matter_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('legal_matter_id');
            $table->uuid('assigned_user_id')->nullable();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('status', 20)->default('todo'); // todo|in_progress|blocked|completed|cancelled
            $table->string('priority', 15)->default('normal'); // low|normal|high
            $table->dateTime('due_at', 6)->nullable();
            $table->dateTime('completed_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->index(['assigned_user_id', 'status', 'due_at']);
            $table->index(['legal_matter_id', 'status']);

            $table->foreign('legal_matter_id')->references('id')->on('legal_matters')->cascadeOnDelete();
            $table->foreign('assigned_user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('matter_timeline', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_matter_id');
            $table->uuid('actor_user_id')->nullable();
            $table->string('event_type', 50);
            $table->string('summary', 500);
            $table->json('payload')->nullable();
            $table->dateTime('occurred_at', 6);
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['legal_matter_id', 'occurred_at']);

            $table->foreign('legal_matter_id')->references('id')->on('legal_matters')->cascadeOnDelete();
            $table->foreign('actor_user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_matters');
        Schema::dropIfExists('matter_members');
        Schema::dropIfExists('matter_actions');
        Schema::dropIfExists('matter_timeline');
    }
};
