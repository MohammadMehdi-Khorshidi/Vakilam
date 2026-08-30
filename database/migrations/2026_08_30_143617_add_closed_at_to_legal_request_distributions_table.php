<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('legal_request_distributions', 'closed_at')) {
            Schema::table('legal_request_distributions', function (Blueprint $table): void {
                $table->dateTime('closed_at', 6)
                    ->nullable()
                    ->after('expires_at');
            });
        }
    }

    public function down(): void
    {
        // Intentionally no-op because fresh installations may already
        // receive this column from the earlier workflow migration.
    }
};
