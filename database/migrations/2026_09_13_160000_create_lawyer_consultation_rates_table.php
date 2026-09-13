<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lawyer_consultation_rates', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('lawyer_profile_id')->constrained('lawyer_profiles')->cascadeOnDelete();
            $table->unsignedSmallInteger('duration_minutes');
            $table->unsignedBigInteger('price_rial');
            $table->timestamps();

            $table->unique(['lawyer_profile_id', 'duration_minutes'], 'lawyer_consultation_rate_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lawyer_consultation_rates');
    }
};
