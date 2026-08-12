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
        Schema::create('contracts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('engagement_id')->unique();
            $table->string('status', 20)->default('draft'); // draft|review|approved|signing|active|terminated|completed
            $table->unsignedInteger('current_version')->default(0);
            $table->dateTime('effective_at', 6)->nullable();
            $table->dateTime('terminated_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->foreign('engagement_id')->references('id')->on('engagements')->restrictOnDelete();
        });

        Schema::create('contract_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('contract_id');
            $table->unsignedInteger('version_number');
            $table->mediumText('terms_text');
            $table->char('terms_hash', 64);
            $table->uuid('created_by');
            $table->string('status', 20)->default('draft'); // draft|issued|superseded|executed
            $table->dateTime('issued_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->unique(['contract_id', 'version_number']);

            $table->foreign('contract_id')->references('id')->on('contracts')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->restrictOnDelete();
        });

        Schema::create('contract_signatures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('contract_version_id');
            $table->uuid('signer_user_id');
            $table->string('signature_method', 30)->default('in_app'); // in_app|otp|third_party
            $table->string('status', 20)->default('pending'); // pending|signed|failed|revoked
            $table->dateTime('signed_at', 6)->nullable();
            $table->json('evidence')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->unique(['contract_version_id', 'signer_user_id']);

            $table->foreign('contract_version_id')->references('id')->on('contract_versions')->cascadeOnDelete();
            $table->foreign('signer_user_id')->references('id')->on('users')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_signatures');
        Schema::dropIfExists('contract_versions');
        Schema::dropIfExists('contracts');    }
};
