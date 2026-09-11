<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('lawyer_proposals')) {
            $database = DB::getDatabaseName();

            $hasUnique = DB::table('information_schema.STATISTICS')
                ->where('TABLE_SCHEMA', $database)
                ->where('TABLE_NAME', 'lawyer_proposals')
                ->where('INDEX_NAME', 'uq_proposals_request_lawyer')
                ->exists();

            if ($hasUnique) {
                Schema::table('lawyer_proposals', function (Blueprint $table): void {
                    $table->dropUnique('uq_proposals_request_lawyer');
                });
            }

            $hasIndex = DB::table('information_schema.STATISTICS')
                ->where('TABLE_SCHEMA', $database)
                ->where('TABLE_NAME', 'lawyer_proposals')
                ->where('INDEX_NAME', 'lawyer_proposals_negotiation_created_index')
                ->exists();

            if (! $hasIndex) {
                Schema::table('lawyer_proposals', function (Blueprint $table): void {
                    $table->index(
                        ['negotiation_id', 'created_at'],
                        'lawyer_proposals_negotiation_created_index'
                    );
                });
            }
        }

        if (
            Schema::hasTable('engagements')
            && ! Schema::hasColumn('engagements', 'agreement_snapshot')
        ) {
            Schema::table('engagements', function (Blueprint $table): void {
                $table->json('agreement_snapshot')->nullable()->after('proposal_id');
            });
        }
    }

    public function down(): void
    {
        if (
            Schema::hasTable('engagements')
            && Schema::hasColumn('engagements', 'agreement_snapshot')
        ) {
            Schema::table('engagements', function (Blueprint $table): void {
                $table->dropColumn('agreement_snapshot');
            });
        }

        if (Schema::hasTable('lawyer_proposals')) {
            Schema::table('lawyer_proposals', function (Blueprint $table): void {
                $table->dropIndex('lawyer_proposals_negotiation_created_index');
                $table->unique(
                    ['legal_request_id', 'lawyer_profile_id'],
                    'uq_proposals_request_lawyer'
                );
            });
        }
    }
};
