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
        Schema::create('lawyer_specialties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lawyer_profile_id');
            $table->uuid('specialty_id');
            $table->unsignedTinyInteger('years_experience')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->unique(['lawyer_profile_id', 'specialty_id']);
            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->cascadeOnDelete();
            $table->foreign('specialty_id')->references('id')->on('specialties')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lawyer_specialties');
    }
};
