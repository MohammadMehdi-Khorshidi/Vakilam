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
        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 60)->unique();           // e.g. lawyers.verify
            $table->string('name', 100);
            $table->string('group_code', 40);               // users|lawyers|finance|support|system
            $table->string('description', 255)->nullable();
            $table->boolean('is_sensitive')->default(false);
            $table->dateTime('created_at', 6)->useCurrent();
            $table->index('group_code');
            $table->index('is_sensitive');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
