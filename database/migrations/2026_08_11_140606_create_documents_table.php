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
        Schema::create('files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('disk', 30)->default('s3'); // local|s3|...
            $table->string('path', 500);
            $table->string('original_name', 255);
            $table->string('mime_type', 120);
            $table->unsignedBigInteger('size_bytes');
            $table->char('checksum_sha256', 64)->nullable();
            $table->string('status', 20)->default('ready'); // uploading|ready|quarantined|deleted
            $table->uuid('uploaded_by')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('deleted_at', 6)->nullable();

            $table->index('status');

            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('public_id')->unique();
            $table->uuid('legal_request_id')->nullable();
            $table->uuid('legal_matter_id')->nullable();
            $table->uuid('owner_user_id');
            $table->uuid('document_type_id')->nullable();
            $table->string('title', 200);
            $table->string('status', 20)->default('active'); // draft|active|archived
            $table->uuid('current_file_id')->nullable();
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('archived_at', 6)->nullable();

            $table->index('legal_request_id');
            $table->index('legal_matter_id');

            $table->foreign('legal_request_id')->references('id')->on('legal_requests')->restrictOnDelete();
            $table->foreign('legal_matter_id')->references('id')->on('legal_matters')->restrictOnDelete();
            $table->foreign('owner_user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('document_type_id')->references('id')->on('document_types')->nullOnDelete();
            $table->foreign('current_file_id')->references('id')->on('files')->nullOnDelete();
        });

        Schema::create('document_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id');
            $table->uuid('file_id');
            $table->unsignedInteger('version_number');
            $table->uuid('uploaded_by');
            $table->dateTime('created_at', 6)->useCurrent();

            $table->unique(['document_id', 'version_number']);

            $table->foreign('document_id')->references('id')->on('documents')->cascadeOnDelete();
            $table->foreign('file_id')->references('id')->on('files')->restrictOnDelete();
            $table->foreign('uploaded_by')->references('id')->on('users')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('files');
    }
};
