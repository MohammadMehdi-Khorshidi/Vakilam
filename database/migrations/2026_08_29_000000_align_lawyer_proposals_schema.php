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

        $hasIndex = function (string $name) use ($database): bool {
            return DB::table('information_schema.STATISTICS')
                ->where('TABLE_SCHEMA', $database)
                ->where('TABLE_NAME', 'lawyer_proposals')
                ->where('INDEX_NAME', $name)
                ->exists();
        };

        $hasConstraint = function (string $name) use ($database): bool {
            return DB::table('information_schema.TABLE_CONSTRAINTS')
                ->where('CONSTRAINT_SCHEMA', $database)
                ->where('TABLE_NAME', 'lawyer_proposals')
                ->where('CONSTRAINT_NAME', $name)
                ->exists();
        };

        /*
         * Bring databases created from the older matching migration
         * in line with the current canonical lawyer_proposals schema.
         */

        if (! Schema::hasColumn('lawyer_proposals', 'legal_request_id')) {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->uuid('legal_request_id')
                    ->nullable()
                    ->after('public_id');
            });
        }

        $distributionNullable = DB::table('information_schema.COLUMNS')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', 'lawyer_proposals')
            ->where('COLUMN_NAME', 'distribution_id')
            ->value('IS_NULLABLE');

        if ($distributionNullable === 'NO') {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->uuid('distribution_id')
                    ->nullable()
                    ->change();
            });
        }

        if (! Schema::hasColumn('lawyer_proposals', 'cover_letter')) {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->text('cover_letter')
                    ->nullable()
                    ->after('summary');
            });
        }

        if (! Schema::hasColumn('lawyer_proposals', 'experience_highlight')) {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->text('experience_highlight')
                    ->nullable()
                    ->after('cover_letter');
            });
        }

        if (! Schema::hasColumn('lawyer_proposals', 'source')) {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->string('source', 20)
                    ->default('matched')
                    ->after('status');
            });
        }

        if (! $hasIndex('uq_proposals_request_lawyer')) {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->unique(
                    ['legal_request_id', 'lawyer_profile_id'],
                    'uq_proposals_request_lawyer'
                );
            });
        }

        if (! $hasIndex('lawyer_proposals_legal_request_id_status_index')) {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->index(['legal_request_id', 'status']);
            });
        }

        if (! $hasIndex('lawyer_proposals_source_status_index')) {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->index(['source', 'status']);
            });
        }

        if (! $hasConstraint('lawyer_proposals_legal_request_id_foreign')) {
            Schema::table('lawyer_proposals', function (Blueprint $table) {
                $table->foreign('legal_request_id')
                    ->references('id')
                    ->on('legal_requests')
                    ->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        /*
         * Intentionally no-op.
         *
         * This is a schema reconciliation migration for databases that were
         * created from an older version of the matching migration.
         *
         * Removing these columns during rollback could destroy columns that
         * already belong to the canonical base schema on newer databases.
         */
    }
};