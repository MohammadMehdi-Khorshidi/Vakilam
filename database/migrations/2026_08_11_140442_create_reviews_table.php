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
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('engagement_id');
            $table->uuid('reviewer_user_id');
            $table->uuid('lawyer_profile_id');
            $table->unsignedTinyInteger('rating'); // 1..5
            $table->text('body')->nullable();
            $table->string('status', 20)->default('published'); // draft|published|hidden|rejected
            $table->dateTime('published_at', 6)->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('deleted_at', 6)->nullable();

            $table->unique(['engagement_id', 'reviewer_user_id']);
            $table->index(['lawyer_profile_id', 'status']);

            $table->foreign('engagement_id')->references('id')->on('engagements')->restrictOnDelete();
            $table->foreign('reviewer_user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
