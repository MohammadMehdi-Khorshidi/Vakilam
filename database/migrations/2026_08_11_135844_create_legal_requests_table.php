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
        Schema::create('legal_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('client_user_id');
            $table->string('title', 200)->nullable();
            $table->text('description');
            $table->uuid('legal_category_id')->nullable();
            $table->unsignedBigInteger('province_id')->nullable();
            $table->unsignedBigInteger('city_id')->nullable();
            $table->string('urgency', 20)->nullable(); // low|normal|high|urgent
            $table->string('service_intent', 30)->default('undecided'); // undecided|consultation|lawyer_selection
            $table->string('status', 20)->default('draft'); // draft|submitted|cancelled|matched|in_progress|closed
            $table->dateTime('submitted_at', 6)->nullable();
            $table->dateTime('cancelled_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->index(['client_user_id', 'status', 'updated_at']);
            $table->index(['status', 'submitted_at']);

            $table->foreign('client_user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('legal_category_id')->references('id')->on('legal_categories')->nullOnDelete();
            $table->foreign('province_id')->references('id')->on('provinces')->nullOnDelete();
            $table->foreign('city_id')->references('id')->on('cities')->nullOnDelete();
        });

        Schema::create('legal_request_parties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('legal_request_id');
            $table->string('party_role', 30); // plaintiff|defendant|witness|other
            $table->string('full_name', 120)->nullable();
            $table->string('relation_note', 255)->nullable();
            $table->boolean('is_client')->default(false);
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index('legal_request_id');

            $table->foreign('legal_request_id')->references('id')->on('legal_requests')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_request_parties');
        Schema::dropIfExists('legal_requests');
    }
};
