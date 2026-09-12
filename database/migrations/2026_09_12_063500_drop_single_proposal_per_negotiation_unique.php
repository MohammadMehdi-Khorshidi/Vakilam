<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('lawyer_proposals')) {
            return;
        }

        $database = DB::getDatabaseName();

        $indexName = 'lawyer_proposals_negotiation_unique';

        $exists = DB::table('information_schema.STATISTICS')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', 'lawyer_proposals')
            ->where('INDEX_NAME', $indexName)
            ->exists();

        if ($exists) {
            Schema::table('lawyer_proposals', function (Blueprint $table) use ($indexName): void {
                $table->dropUnique($indexName);
            });
        }

        $normalIndex = 'lawyer_proposals_negotiation_id_index';

        $hasNormalIndex = DB::table('information_schema.STATISTICS')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', 'lawyer_proposals')
            ->where('INDEX_NAME', $normalIndex)
            ->exists();

        if (! $hasNormalIndex) {
            Schema::table('lawyer_proposals', function (Blueprint $table): void {
                $table->index(
                    'negotiation_id',
                    'lawyer_proposals_negotiation_id_index',
                );
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('lawyer_proposals')) {
            return;
        }

        $database = DB::getDatabaseName();

        $normalIndex = 'lawyer_proposals_negotiation_id_index';

        $hasNormalIndex = DB::table('information_schema.STATISTICS')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', 'lawyer_proposals')
            ->where('INDEX_NAME', $normalIndex)
            ->exists();

        if ($hasNormalIndex) {
            Schema::table('lawyer_proposals', function (Blueprint $table) use ($normalIndex): void {
                $table->dropIndex($normalIndex);
            });
        }

        $uniqueName = 'lawyer_proposals_negotiation_unique';

        $hasUnique = DB::table('information_schema.STATISTICS')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', 'lawyer_proposals')
            ->where('INDEX_NAME', $uniqueName)
            ->exists();

        if (! $hasUnique) {
            Schema::table('lawyer_proposals', function (Blueprint $table): void {
                $table->unique(
                    'negotiation_id',
                    'lawyer_proposals_negotiation_unique',
                );
            });
        }
    }
};
