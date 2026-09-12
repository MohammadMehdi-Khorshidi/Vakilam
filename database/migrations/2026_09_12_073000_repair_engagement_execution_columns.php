<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('engagements')) {
            return;
        }

        Schema::table('engagements', function (Blueprint $table): void {
            if (! Schema::hasColumn('engagements', 'execution_details')) {
                $table->json('execution_details')->nullable()->after('agreement_snapshot');
            }

            if (! Schema::hasColumn('engagements', 'prepared_at')) {
                $table->timestamp('prepared_at')->nullable()->after('contract_due_at');
            }

            if (! Schema::hasColumn('engagements', 'contract_sent_at')) {
                $table->timestamp('contract_sent_at')->nullable()->after('prepared_at');
            }
        });
    }

    public function down(): void
    {
        // Repair migration intentionally keeps columns on rollback.
    }
};
