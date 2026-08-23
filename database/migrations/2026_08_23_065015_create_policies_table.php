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
        Schema::create('policies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type', 40);                         // terms_of_service|privacy_policy|lawyer_terms|client_terms|refund_policy|cookie_policy
            $table->string('version', 20);                      // مثلاً 1.0 یا 2026-08
            $table->string('title', 200);
            $table->longText('content');                        // Markdown یا HTML
            $table->dateTime('effective_from', 6);              // از این تاریخ لازم‌الاجراست
            $table->boolean('is_current')->default(false);      // فقط یک نسخه از هر type می‌تواند true باشد
            $table->dateTime('published_at', 6)->nullable();
            $table->uuid('created_by')->nullable();             // ادمین ناشر
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();

            $table->unique(['type', 'version']);
            $table->index(['type', 'is_current']);
            $table->index(['type', 'effective_from']);

            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('policies');
    }
};
