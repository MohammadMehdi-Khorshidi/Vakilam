<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table): void {
            if (! Schema::hasColumn('consultations', 'price_rial')) {
                $table->unsignedBigInteger('price_rial')->nullable()->after('duration_minutes');
            }
            if (! Schema::hasColumn('consultations', 'hold_expires_at')) {
                $table->timestamp('hold_expires_at')->nullable()->after('price_rial');
            }
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table): void {
            if (Schema::hasColumn('consultations', 'hold_expires_at')) {
                $table->dropColumn('hold_expires_at');
            }
            if (Schema::hasColumn('consultations', 'price_rial')) {
                $table->dropColumn('price_rial');
            }
        });
    }
};
