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
        Schema::create('lawyer_match_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_request_id');
            $table->string('algorithm_version', 20)->default('v1');
            $table->string('status', 20)->default('completed'); // queued|running|completed|failed
            $table->unsignedSmallInteger('candidates_count')->default(0);
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('completed_at', 6)->nullable();
            $table->index('legal_request_id');
            $table->foreign('legal_request_id')->references('id')->on('legal_requests')->cascadeOnDelete();
        });

        Schema::create('lawyer_match_candidates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('match_run_id');
            $table->uuid('lawyer_profile_id');
            $table->decimal('score', 6, 3)->default(0);
            $table->unsignedSmallInteger('rank_position')->nullable();
            $table->json('explanation')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->unique(['match_run_id', 'lawyer_profile_id'], 'match_run_lawyer_unique');
            $table->index(['match_run_id', 'score']);
            $table->foreign('match_run_id')->references('id')->on('lawyer_match_runs')->cascadeOnDelete();
            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->cascadeOnDelete();
        });

        Schema::create('legal_request_distributions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_request_id');
            $table->uuid('lawyer_profile_id');
            $table->uuid('match_candidate_id')->nullable();
            $table->string('status', 20)->default('sent');
            $table->dateTime('sent_at', 6);
            $table->dateTime('viewed_at', 6)->nullable();
            $table->dateTime('expires_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->unique(['legal_request_id', 'lawyer_profile_id'], 'legal_req_lawyer_unique');
            $table->index(['lawyer_profile_id', 'status', 'sent_at'], 'lawyer_status_sent_idx');
            $table->foreign('legal_request_id')->references('id')->on('legal_requests')->cascadeOnDelete();
            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->cascadeOnDelete();
            $table->foreign('match_candidate_id')->references('id')->on('lawyer_match_candidates')->nullOnDelete();
        });

        Schema::create('lawyer_proposals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('distribution_id')->unique();
            $table->uuid('lawyer_profile_id');
            $table->text('summary')->nullable();
            $table->unsignedBigInteger('proposed_fee_rial')->nullable();
            $table->unsignedSmallInteger('estimated_days')->nullable();
            $table->string('status', 20)->default('draft'); // draft|submitted|withdrawn|shortlisted|selected|rejected|expired
            $table->dateTime('submitted_at', 6)->nullable();
            $table->dateTime('expires_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->index(['lawyer_profile_id', 'status']);
            $table->foreign('distribution_id')->references('id')->on('legal_request_distributions')->restrictOnDelete();
            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lawyer_proposals');
        Schema::dropIfExists('legal_request_distributions');
        Schema::dropIfExists('lawyer_match_candidates');
        Schema::dropIfExists('lawyer_match_runs');
    }
};
