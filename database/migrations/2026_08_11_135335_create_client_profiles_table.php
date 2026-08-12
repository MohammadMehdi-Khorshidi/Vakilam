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
        Schema::create('client_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->string('full_name', 120)->nullable();
            $table->char('national_code', 10)->nullable();
            $table->unsignedBigInteger('province_id')->nullable();
            $table->unsignedBigInteger('city_id')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();
            $table->dateTime('deleted_at', 6)->nullable();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('province_id')->references('id')->on('provinces')->restrictOnDelete();
            $table->foreign('city_id')->references('id')->on('cities')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_profiles');
    }
};
