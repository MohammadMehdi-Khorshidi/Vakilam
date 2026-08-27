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
        Schema::create('lawyer_service_areas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lawyer_profile_id');
            $table->unsignedBigInteger('province_id');
            $table->unsignedBigInteger('city_id')->nullable(); // null = whole province
            $table->dateTime('created_at', 6)->useCurrent();
            $table->unique(['lawyer_profile_id', 'province_id', 'city_id'], 'lawyer_area_unique');
            $table->foreign('lawyer_profile_id')->references('id')->on('lawyer_profiles')->cascadeOnDelete();
            $table->foreign('province_id')->references('id')->on('provinces')->restrictOnDelete();
            $table->foreign('city_id')->references('id')->on('cities')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lawyer_service_areas');
    }
};
