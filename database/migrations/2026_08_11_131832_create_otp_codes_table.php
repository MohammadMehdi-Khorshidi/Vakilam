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
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('mobile', 15);
            $table->string('purpose', 30); // login|register|verify_mobile
            $table->char('code_hash', 64); // SHA-256
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->dateTime('expires_at', 6);
            $table->dateTime('consumed_at', 6)->nullable();
            $table->index(['mobile', 'purpose', 'created_at']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};
