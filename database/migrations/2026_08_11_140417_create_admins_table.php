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
        Schema::create('admin_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('admin_user_id');
            $table->string('action_type', 60);
            $table->string('target_type', 40);
            $table->uuid('target_id')->nullable();
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();

            $table->index(['admin_user_id', 'created_at']);
            $table->index(['target_type', 'target_id']);

            $table->foreign('admin_user_id')->references('id')->on('users')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_actions');
    }
};
