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
        Schema::create('proposal_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('proposal_id');
            $table->uuid('file_id');
            $table->string('attachment_type', 30)->default('other');
            $table->string('title', 200)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['proposal_id', 'sort_order'], 'idx_proposal_attachments_proposal');
            $table->foreign('proposal_id')->references('id')->on('lawyer_proposals')->cascadeOnDelete();
            $table->foreign('file_id')->references('id')->on('files')->restrictOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_attachments');
    }
};
