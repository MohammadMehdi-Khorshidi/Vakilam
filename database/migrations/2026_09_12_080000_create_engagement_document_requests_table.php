<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('engagement_document_requests')) {
            return;
        }

        Schema::create('engagement_document_requests', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('engagement_id');
            $table->uuid('document_id')->nullable();
            $table->uuid('requested_by');
            $table->uuid('reviewed_by')->nullable();
            $table->string('title', 160);
            $table->text('instructions')->nullable();
            $table->boolean('is_required')->default(true);
            $table->string('status', 30)->default('requested');
            $table->text('review_note')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['engagement_id', 'status'], 'eng_doc_requests_eng_status_idx');
            $table->foreign('engagement_id')
                ->references('id')
                ->on('engagements')
                ->cascadeOnDelete();
            $table->foreign('document_id')
                ->references('id')
                ->on('documents')
                ->nullOnDelete();
            $table->foreign('requested_by')
                ->references('id')
                ->on('users')
                ->restrictOnDelete();
            $table->foreign('reviewed_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('engagement_document_requests');
    }
};
