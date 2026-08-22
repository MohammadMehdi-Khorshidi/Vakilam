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
        Schema::create('lawyer_availabilities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('lawyer_profile_id');
            // بازه زمانی (UTC)
            $table->dateTime('starts_at', 6);
            $table->dateTime('ends_at', 6);
            // open = آزاد | booked = رزرو شده | blocked = مسدود توسط وکیل | cancelled = لغو شده
            $table->string('status', 20)->default('open');
            // بعد از رزرو به یکی از این دو وصل می‌شود (نه هر دو هم‌زمان)
            $table->uuid('consultation_id')->nullable();
            $table->uuid('meeting_id')->nullable();
            $table->string('note', 255)->nullable(); // یادداشت داخلی وکیل
            $table->dateTime('created_at', 6)->useCurrent();
            $table->dateTime('updated_at', 6)->useCurrent()->useCurrentOnUpdate();
            // ایندکس اصلی برای پیدا کردن اسلات‌های آزاد یک وکیل
            $table->index(['lawyer_profile_id', 'status', 'starts_at'], 'idx_slots_lawyer_status_start');
            // برای جلوگیری از تداخل زمانی در لایه اپ + گزارش
            $table->index(['lawyer_profile_id', 'starts_at', 'ends_at'], 'idx_slots_lawyer_range');
            $table->foreign('lawyer_profile_id')
                ->references('id')->on('lawyer_profiles')
                ->cascadeOnDelete();
            $table->foreign('consultation_id')
                ->references('id')->on('consultations')
                ->nullOnDelete();
            $table->foreign('meeting_id')
                ->references('id')->on('meetings')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lawyer_availabilities');
    }
};
