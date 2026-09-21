<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;

class AdminPanelDoctor extends Command
{
    protected $signature = 'vakilam:admin-doctor';
    protected $description = 'Show registered Vakilam admin panel routes';

    public function handle(): int
    {
        $routes = collect(Route::getRoutes()->getRoutes())
            ->filter(fn ($route) => str_starts_with($route->uri(), 'admin'))
            ->map(fn ($route) => [
                'method' => implode('|', $route->methods()),
                'uri' => $route->uri(),
                'name' => $route->getName(),
            ])
            ->values();

        $this->table(['Method', 'URI', 'Name'], $routes->map(fn ($r) => [
            $r['method'], $r['uri'], $r['name'],
        ])->all());

        return self::SUCCESS;
    }
}
