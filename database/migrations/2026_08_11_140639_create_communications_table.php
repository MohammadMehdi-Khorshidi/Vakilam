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
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('legal_matter_id')->nullable();
            $table->uuid('consultation_id')->nullable();
            $table->string('status', 20)->default('active'); // active|closed
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('closed_at', 6)->nullable();

            $table->foreign('legal_matter_id')->references('id')->on('legal_matters')->restrictOnDelete();
            $table->foreign('consultation_id')->references('id')->on('consultations')->restrictOnDelete();
        });

        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->uuid('user_id');
            $table->dateTime('joined_at', 6);
            $table->dateTime('left_at', 6)->nullable();

            $table->unique(['conversation_id', 'user_id']);
            $table->index('user_id');

            $table->foreign('conversation_id')->references('id')->on('conversations')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('conversation_id');
            $table->uuid('sender_user_id');
            $table->text('body');
            $table->string('status', 20)->default('sent'); // sent|deleted
            $table->dateTime('sent_at', 6);
            $table->dateTime('edited_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['conversation_id', 'sent_at']);

            $table->foreign('conversation_id')->references('id')->on('conversations')->cascadeOnDelete();
            $table->foreign('sender_user_id')->references('id')->on('users')->restrictOnDelete();
        });

        Schema::create('meetings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('legal_matter_id')->nullable();
            $table->uuid('consultation_id')->nullable();
            $table->uuid('organizer_user_id');
            $table->string('meeting_mode', 20); // video|audio|in_person
            $table->string('status', 20)->default('proposed'); // proposed|scheduled|in_progress|completed|cancelled|no_show
            $table->string('title', 200)->nullable();
            $table->dateTime('starts_at', 6);
            $table->dateTime('ends_at', 6)->nullable();
            $table->string('meeting_url', 500)->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->index('starts_at');

            $table->foreign('legal_matter_id')->references('id')->on('legal_matters')->restrictOnDelete();
            $table->foreign('consultation_id')->references('id')->on('consultations')->restrictOnDelete();
            $table->foreign('organizer_user_id')->references('id')->on('users')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};
