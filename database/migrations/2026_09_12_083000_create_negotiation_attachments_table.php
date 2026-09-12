<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('negotiation_attachments')) {
            return;
        }

        Schema::create('negotiation_attachments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('negotiation_id');
            $table->uuid('sender_user_id');
            $table->string('disk', 30)->default('local');
            $table->string('path', 500);
            $table->string('original_name', 255);
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size_bytes');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['negotiation_id', 'expires_at'], 'neg_attach_neg_exp_idx');
            $table->index('expires_at');

            $table->foreign('negotiation_id')
                ->references('id')
                ->on('negotiations')
                ->cascadeOnDelete();

            $table->foreign('sender_user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('negotiation_attachments');
    }
};
