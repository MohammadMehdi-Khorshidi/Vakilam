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
            $apiKey = trim((string) config('services.ippanel.api_key'));

            // Tests never call an external SMS provider. Local development may
            // also run without IPPanel credentials and use the debug OTP.
            if ($app->environment('testing')) {
                return $app->make(NullOtpSender::class);
            }

            if ($app->environment('local') && $apiKey === '') {
                return $app->make(NullOtpSender::class);
            }

            // Outside local/testing, always resolve the real sender. Missing or
            // incomplete credentials are then reported as a controlled 503 by
            // the auth controller instead of silently pretending an SMS sent.
            return $app->make(IppanelOtpSender::class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontend = config('app.frontend_url', config('app.url'));

            return rtrim((string) $frontend, '/')."/password-reset/{$token}?email=".urlencode(
                    $notifiable->getEmailForPasswordReset()
                );
        });
    }
}
