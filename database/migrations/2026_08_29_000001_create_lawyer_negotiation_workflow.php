<?php

use App\Models\Contract;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('legal_request_distributions', function (Blueprint $table) {
            $table->dateTime('responded_at', 6)->nullable()->after('viewed_at');
            $table->dateTime('closed_at', 6)->nullable()->after('expires_at');
        });

        Schema::create('negotiation_threads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('distribution_id')->unique();
            $table->string('status', 20)->default('open');
            $table->dateTime('started_at', 6);
            $table->dateTime('agreed_at', 6)->nullable();
            $table->dateTime('cancelled_at', 6)->nullable();
            $table->dateTime('closed_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->index(['status', 'updated_at']);
            $table->foreign('distribution_id')
                ->references('id')
                ->on('legal_request_distributions')
                ->restrictOnDelete();
        });

        Schema::create('negotiation_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('negotiation_thread_id');
            $table->uuid('sender_user_id');
            $table->text('body');
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['negotiation_thread_id', 'created_at']);
            $table->foreign('negotiation_thread_id')
                ->references('id')
                ->on('negotiation_threads')
                ->cascadeOnDelete();
            $table->foreign('sender_user_id')
                ->references('id')
                ->on('users')
                ->restrictOnDelete();
        });

        Schema::table('lawyer_proposals', function (Blueprint $table) {
            $table->dropUnique('uq_proposals_request_lawyer');
            $table->string('source', 20)->default('invited')->change();

            $table->uuid('negotiation_thread_id')->nullable()->after('distribution_id');
            $table->uuid('parent_proposal_id')->nullable()->after('negotiation_thread_id');
            $table->unsignedSmallInteger('version_number')->default(1)->after('parent_proposal_id');
            $table->unsignedBigInteger('advance_payment_rial')->nullable()->after('proposed_fee_rial');
            $table->json('service_scope')->nullable()->after('estimated_days');
            $table->json('excluded_services')->nullable()->after('service_scope');
            $table->json('payment_terms')->nullable()->after('excluded_services');
            $table->text('other_terms')->nullable()->after('payment_terms');
            $table->char('terms_hash', 64)->nullable()->after('other_terms');
            $table->dateTime('accepted_at', 6)->nullable()->after('expires_at');
            $table->dateTime('rejected_at', 6)->nullable()->after('accepted_at');
            $table->dateTime('countered_at', 6)->nullable()->after('rejected_at');

            $table->unique(
                ['negotiation_thread_id', 'version_number'],
                'negotiation_proposal_version_unique',
            );
            $table->index(['negotiation_thread_id', 'status']);
            $table->foreign('negotiation_thread_id')
                ->references('id')
                ->on('negotiation_threads')
                ->restrictOnDelete();
            $table->foreign('parent_proposal_id')
                ->references('id')
                ->on('lawyer_proposals')
                ->restrictOnDelete();
        });

        DB::table('lawyer_proposals')
            ->where('source', 'matched')
            ->update(['source' => 'invited']);

        Schema::table('invoices', function (Blueprint $table) {
            $table->uuid('contract_id')->nullable()->change();
            $table->string('purpose', 30)->default('lawyer_contract')->after('contract_id');
            $table->string('payable_type')->nullable()->after('purpose');
            $table->uuid('payable_id')->nullable()->after('payable_type');
            $table->index(
                ['payable_type', 'payable_id'],
                'invoices_payable_index',
            );
        });

        DB::table('invoices')
            ->whereNotNull('contract_id')
            ->update([
                'payable_type' => Contract::class,
                'payable_id' => DB::raw('contract_id'),
            ]);

        Schema::table('legal_matters', function (Blueprint $table) {
            $table->string('origin_type', 30)
                ->default('lawyer_selection')
                ->after('source_legal_request_id');
            $table->string('originable_type')->nullable()->after('origin_type');
            $table->uuid('originable_id')->nullable()->after('originable_type');
            $table->index(
                ['originable_type', 'originable_id'],
                'legal_matters_originable_index',
            );
        });
    }

    public function down(): void
    {
        Schema::table('legal_matters', function (Blueprint $table) {
            $table->dropIndex('legal_matters_originable_index');
            $table->dropColumn([
                'origin_type',
                'originable_type',
                'originable_id',
            ]);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('invoices_payable_index');
            $table->dropColumn(['purpose', 'payable_type', 'payable_id']);
            $table->uuid('contract_id')->nullable(false)->change();
        });

        Schema::table('lawyer_proposals', function (Blueprint $table) {
            $table->dropForeign(['parent_proposal_id']);
            $table->dropForeign(['negotiation_thread_id']);
            $table->dropUnique('negotiation_proposal_version_unique');
            $table->dropIndex(['negotiation_thread_id', 'status']);
            $table->dropColumn([
                'negotiation_thread_id',
                'parent_proposal_id',
                'version_number',
                'advance_payment_rial',
                'service_scope',
                'excluded_services',
                'payment_terms',
                'other_terms',
                'terms_hash',
                'accepted_at',
                'rejected_at',
                'countered_at',
            ]);
            $table->unique(
                ['legal_request_id', 'lawyer_profile_id'],
                'uq_proposals_request_lawyer',
            );
            $table->string('source', 20)->default('matched')->change();
        });

        Schema::dropIfExists('negotiation_messages');
        Schema::dropIfExists('negotiation_threads');

        Schema::table('legal_request_distributions', function (Blueprint $table) {
            $table->dropColumn(['responded_at', 'closed_at']);
        });
    }
};
