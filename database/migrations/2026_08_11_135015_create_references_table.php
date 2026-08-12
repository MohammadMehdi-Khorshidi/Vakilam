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
        Schema::create('legal_categories', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('code', 40)->unique(); // family|civil|criminal|...
                $table->string('name', 80);
                $table->boolean('status')->default(true);
                $table->smallInteger('sort_order')->default(0);
            });

        Schema::create('specialties', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('code', 40)->unique();
                $table->string('name', 80);
                $table->boolean('status')->default(true);
            });

        Schema::create('document_types', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('code', 40)->unique();
                $table->string('name', 80);
                $table->boolean('status')->default(true);
            });
        }

    public function down(): void
    {
        Schema::dropIfExists('document_types');
        Schema::dropIfExists('specialties');
        Schema::dropIfExists('legal_categories');
    }
};
