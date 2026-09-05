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
            // Prefer Null sender in testing; otherwise real IPPanel sender.
            // Also fall back to Null when API key is missing so local/dev does not crash.
            if ($app->environment('testing')) {
                return $app->make(NullOtpSender::class);
            }

            $apiKey = (string) config('services.ippanel.api_key');
            if ($apiKey === '') {
                return $app->make(NullOtpSender::class);
            }

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
