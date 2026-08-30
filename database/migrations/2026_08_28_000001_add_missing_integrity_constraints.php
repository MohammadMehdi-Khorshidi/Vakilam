<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cities', function (Blueprint $table) {
            $table->foreign('province_id', 'cities_province_id_foreign')
                ->references('id')
                ->on('provinces')
                ->restrictOnDelete();
        });

        Schema::table('user_roles', function (Blueprint $table) {
            $table->foreign('user_id', 'user_roles_user_id_foreign')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('role_id', 'user_roles_role_id_foreign')
                ->references('id')
                ->on('roles')
                ->cascadeOnDelete();
        });

        Schema::table('engagements', function (Blueprint $table) {
            $table->unique('legal_request_id', 'engagements_legal_request_unique');
        });

        Schema::table('legal_matters', function (Blueprint $table) {
            $table->unique('source_legal_request_id', 'legal_matters_source_request_unique');
            $table->unique('engagement_id', 'legal_matters_engagement_unique');
        });
    }

    public function down(): void
    {
        Schema::table('legal_matters', function (Blueprint $table) {
            $table->dropForeign(['source_legal_request_id']);
            $table->dropForeign(['engagement_id']);
        });

        Schema::table('engagements', function (Blueprint $table) {
            $table->dropForeign(['legal_request_id']);
        });

        Schema::table('legal_matters', function (Blueprint $table) {
            $table->dropUnique('legal_matters_source_request_unique');
            $table->dropUnique('legal_matters_engagement_unique');
        });

        Schema::table('engagements', function (Blueprint $table) {
            $table->dropUnique('engagements_legal_request_unique');
        });

        Schema::table('engagements', function (Blueprint $table) {
            $table->foreign('legal_request_id')
                ->references('id')
                ->on('legal_requests')
                ->restrictOnDelete();
        });

        Schema::table('legal_matters', function (Blueprint $table) {
            $table->foreign('source_legal_request_id')
                ->references('id')
                ->on('legal_requests')
                ->restrictOnDelete();

            $table->foreign('engagement_id')
                ->references('id')
                ->on('engagements')
                ->nullOnDelete();
        });

        Schema::table('user_roles', function (Blueprint $table) {
            $table->dropForeign('user_roles_user_id_foreign');
            $table->dropForeign('user_roles_role_id_foreign');
        });

        Schema::table('cities', function (Blueprint $table) {
            $table->dropForeign('cities_province_id_foreign');
        });
    }
};
