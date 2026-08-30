<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $duplicates = DB::table('user_roles')
                ->select('user_id', 'role_id')
                ->whereNull('revoked_at')
                ->groupBy('user_id', 'role_id')
                ->havingRaw('COUNT(*) > 1')
                ->get();

            $revocationBase = now();
            $revocationSequence = 1;

            foreach ($duplicates as $duplicate) {
                $assignments = DB::table('user_roles')
                    ->where('user_id', $duplicate->user_id)
                    ->where('role_id', $duplicate->role_id)
                    ->whereNull('revoked_at')
                    ->orderBy('granted_at')
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                foreach ($assignments->skip(1) as $assignment) {
                    do {
                        $revokedAt = $revocationBase
                            ->copy()
                            ->addMicroseconds($revocationSequence++);
                    } while (
                        DB::table('user_roles')
                            ->where('user_id', $duplicate->user_id)
                            ->where('role_id', $duplicate->role_id)
                            ->where('revoked_at', $revokedAt)
                            ->exists()
                    );

                    DB::table('user_roles')
                        ->where('id', $assignment->id)
                        ->update([
                            'revoked_at' => $revokedAt,
                        ]);
                }
            }
        });

        Schema::table('user_roles', function (Blueprint $table): void {
            $table->unsignedTinyInteger('active_role_marker')
                ->storedAs(
                    'CASE WHEN `revoked_at` IS NULL THEN 1 ELSE NULL END',
                )
                ->after('revoked_at');

            $table->unique(
                ['user_id', 'role_id', 'active_role_marker'],
                'user_roles_one_active_role_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::table('user_roles', function (Blueprint $table): void {
            $table->dropUnique('user_roles_one_active_role_unique');
            $table->dropColumn('active_role_marker');
        });

        /*
         * Duplicate assignments cleaned during up() intentionally remain
         * revoked so rolling back cannot recreate invalid active duplicates.
         */
    }
};
