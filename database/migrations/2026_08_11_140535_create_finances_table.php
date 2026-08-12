<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('contract_id');
            $table->uuid('client_user_id');
            $table->unsignedBigInteger('subtotal_rial');
            $table->unsignedBigInteger('discount_rial')->default(0);
            $table->unsignedBigInteger('tax_rial')->default(0);
            $table->unsignedBigInteger('total_rial');
            $table->string('status', 20)->default('draft'); // draft|issued|partially_paid|paid|void|overdue
            $table->dateTime('issued_at', 6)->nullable();
            $table->dateTime('due_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['client_user_id', 'status', 'due_at']);

            $table->foreign('contract_id')->references('id')->on('contracts')->restrictOnDelete();
            $table->foreign('client_user_id')->references('id')->on('users')->restrictOnDelete();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('invoice_id');
            $table->uuid('payer_user_id');
            $table->unsignedBigInteger('amount_rial');
            $table->string('status', 20)->default('created'); // created|pending|succeeded|failed|cancelled|refunded
            $table->string('gateway', 40)->nullable();
            $table->string('gateway_ref', 100)->nullable();
            $table->string('idempotency_key', 64)->unique();
            $table->dateTime('paid_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['invoice_id', 'status']);

            $table->foreign('invoice_id')->references('id')->on('invoices')->restrictOnDelete();
            $table->foreign('payer_user_id')->references('id')->on('users')->restrictOnDelete();
        });

        Schema::create('settlements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('lawyer_profile_id');
            $table->unsignedBigInteger('amount_rial');
            $table->string('status', 20)->default('pending'); // pending|processing|paid|failed
            $table->dateTime('paid_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['lawyer_profile_id', 'status']);

            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settlements');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
    }
};
