<?php

use App\Models\LawyerProposal;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    LawyerProposal::query()
        ->where('status', 'submitted')
        ->whereNotNull('expires_at')
        ->where('expires_at', '<=', now())
        ->update([
            'status' => 'expired',
        ]);
})->everyMinute();