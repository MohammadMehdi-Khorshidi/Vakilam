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
        Schema::create('ai_interactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('user_id');
            $table->uuid('legal_request_id')->nullable();
            $table->uuid('legal_matter_id')->nullable();
            $table->string('purpose', 50); // summarize|extract|suggest_category|draft_response|...
            $table->string('provider', 40); // openai|anthropic|local|...
            $table->string('model', 80);
            $table->string('status', 20)->default('queued'); // queued|running|completed|failed|cancelled
            $table->text('input_summary')->nullable();
            $table->mediumText('output_text')->nullable();
            $table->decimal('confidence', 5, 4)->nullable();
            $table->boolean('requires_review')->default(true);
            $table->dateTime('started_at', 6)->nullable();
            $table->dateTime('completed_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index('legal_request_id');

            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('legal_request_id')->references('id')->on('legal_requests')->nullOnDelete();
            $table->foreign('legal_matter_id')->references('id')->on('legal_matters')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_interactions');
    }
};
