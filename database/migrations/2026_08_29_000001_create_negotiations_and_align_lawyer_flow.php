<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('negotiations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('legal_request_id');
            $table->uuid('lawyer_profile_id');
            $table->uuid('distribution_id')->nullable();
            $table->string('source', 30); // client_invite|lawyer_interest
            $table->string('status', 30)->default('active'); // active|proposal_submitted|closed|cancelled|won
            $table->dateTime('opened_at', 6);
            $table->dateTime('closed_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->unique(['legal_request_id', 'lawyer_profile_id'], 'negotiation_request_lawyer_unique');
            $table->index(['legal_request_id', 'status']);
            $table->index(['lawyer_profile_id', 'status']);

            $table->foreign('legal_request_id')->references('id')->on('legal_requests')->cascadeOnDelete();
            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->cascadeOnDelete();
            $table->foreign('distribution_id')->references('id')->on('legal_request_distributions')->nullOnDelete();
        });

        Schema::create('negotiation_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('negotiation_id');
            $table->uuid('sender_user_id');
            $table->text('body');
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['negotiation_id', 'created_at']);
            $table->foreign('negotiation_id')->references('id')->on('negotiations')->cascadeOnDelete();
            $table->foreign('sender_user_id')->references('id')->on('users')->restrictOnDelete();
        });

        Schema::table('legal_request_distributions', function (Blueprint $table) {
            $table->string('source', 30)->default('client_invite')->after('match_candidate_id');
            $table->dateTime('responded_at', 6)->nullable()->after('viewed_at');
            $table->dateTime('closed_at', 6)->nullable()->after('expires_at');
            $table->index(['source', 'status'], 'distribution_source_status_idx');
        });

        Schema::table('lawyer_proposals', function (Blueprint $table) {
            $table->uuid('negotiation_id')->nullable()->after('legal_request_id');
            $table->text('service_scope')->nullable()->after('summary');
            $table->unique('negotiation_id', 'lawyer_proposals_negotiation_unique');
            $table->foreign('negotiation_id')->references('id')->on('negotiations')->restrictOnDelete();
        });

        // Older proposal rows were created through a distribution without filling
        // lawyer_proposals.legal_request_id. Backfill that direct relation so the
        // new request-centric proposal APIs can still locate historical rows.
        DB::table('lawyer_proposals')
            ->whereNull('legal_request_id')
            ->whereNotNull('distribution_id')
            ->orderBy('id')
            ->get(['id', 'distribution_id', 'lawyer_profile_id'])
            ->each(function (object $proposal): void {
                $legalRequestId = DB::table('legal_request_distributions')
                    ->where('id', $proposal->distribution_id)
                    ->value('legal_request_id');

                if ($legalRequestId !== null) {
                    $wouldDuplicate = DB::table('lawyer_proposals')
                        ->where('id', '!=', $proposal->id)
                        ->where('legal_request_id', $legalRequestId)
                        ->where('lawyer_profile_id', $proposal->lawyer_profile_id)
                        ->exists();

                    if (! $wouldDuplicate) {
                        DB::table('lawyer_proposals')
                            ->where('id', $proposal->id)
                            ->update(['legal_request_id' => $legalRequestId]);
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('lawyer_proposals', function (Blueprint $table) {
            $table->dropForeign(['negotiation_id']);
            $table->dropUnique('lawyer_proposals_negotiation_unique');
            $table->dropColumn(['negotiation_id', 'service_scope']);
        });

        Schema::table('legal_request_distributions', function (Blueprint $table) {
            $table->dropIndex('distribution_source_status_idx');
            $table->dropColumn(['source', 'responded_at', 'closed_at']);
        });

        Schema::dropIfExists('negotiation_messages');
        Schema::dropIfExists('negotiations');
    }
};
