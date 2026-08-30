<?php

namespace App\Providers;

use App\Contracts\OtpSender;
use App\Services\Sms\IppanelOtpSender;
use App\Services\Sms\NullOtpSender;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(OtpSender::class, function (Application $app): OtpSender {
            return $app->environment('testing')
                ? $app->make(NullOtpSender::class)
                : $app->make(IppanelOtpSender::class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
