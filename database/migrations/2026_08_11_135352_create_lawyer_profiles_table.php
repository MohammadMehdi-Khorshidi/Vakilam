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
        Schema::create('lawyer_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('user_id')->unique();
            $table->string('full_name', 120);
            $table->string('license_number', 30)->nullable();
            $table->text('bio')->nullable();
            $table->string('verification_status', 20)->default('pending'); // pending|needs_fix|approved|rejected|suspended
            $table->decimal('average_rating', 3, 2)->nullable();
            $table->unsignedInteger('rating_count')->default(0);
            $table->boolean('is_available')->default(true);
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();
            $table->dateTime('deleted_at', 6)->nullable();

            $table->index('verification_status');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lawyer_profiles');
    }
};
