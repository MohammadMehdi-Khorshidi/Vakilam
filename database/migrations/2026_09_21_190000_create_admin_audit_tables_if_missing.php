<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('admin_actions')) {
            Schema::create('admin_actions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('admin_user_id')->nullable();
                $table->string('action_type', 80);
                $table->string('target_type', 120)->nullable();
                $table->uuid('target_id')->nullable();
                $table->text('reason')->nullable();
                $table->json('metadata')->nullable();
                $table->dateTime('created_at', 6)->useCurrent();

                $table->index(['admin_user_id', 'created_at']);
                $table->index(['target_type', 'target_id']);
                $table->foreign('admin_user_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            });
        }

        if (! Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('actor_user_id')->nullable();
                $table->string('action', 120);
                $table->string('target_type', 120)->nullable();
                $table->uuid('target_id')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->json('metadata')->nullable();
                $table->dateTime('created_at', 6)->useCurrent();

                $table->index(['actor_user_id', 'created_at']);
                $table->index(['target_type', 'target_id']);
                $table->foreign('actor_user_id')
                    ->references('id')
                    ->on('users')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        // These tables may predate this migration in some installations.
        // Deliberately keep audit history on rollback.
    }
};
