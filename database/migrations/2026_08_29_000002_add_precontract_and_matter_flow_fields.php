<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('engagements', function (Blueprint $table) {
            $table->dateTime('contract_due_at', 6)->nullable()->after('status');
            $table->index(['status', 'contract_due_at'], 'engagement_contract_due_idx');
        });

        Schema::create('engagement_confirmations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('engagement_id');
            $table->uuid('user_id');
            $table->string('role', 20); // client|lawyer
            $table->dateTime('confirmed_at', 6);
            $table->dateTime('created_at', 6)->useCurrent();

            $table->unique(['engagement_id', 'user_id'], 'engagement_confirmation_user_unique');
            $table->index(['engagement_id', 'role']);
            $table->foreign('engagement_id')->references('id')->on('engagements')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
        });

        Schema::table('legal_matters', function (Blueprint $table) {
            $table->string('origin_type', 30)->nullable()->after('client_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('legal_matters', function (Blueprint $table) {
            $table->dropColumn('origin_type');
        });

        Schema::dropIfExists('engagement_confirmations');

        Schema::table('engagements', function (Blueprint $table) {
            $table->dropIndex('engagement_contract_due_idx');
            $table->dropColumn('contract_due_at');
        });
    }
};
