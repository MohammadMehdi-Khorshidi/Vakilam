import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const nextDirectory = dirname(fileURLToPath(import.meta.url));

function readLaravelEnv(name) {
    try {
        const envPath = resolve(nextDirectory, '../..', '.env');
        const contents = readFileSync(envPath, 'utf8');
        const line = contents
            .split(/\r?\n/)
            .find((candidate) => candidate.trim().startsWith(`${name}=`));

        if (!line) return '';

        let value = line.slice(line.indexOf('=') + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        return value.trim();
    } catch {
        return '';
    }
}

function withoutApiSuffix(value) {
    return String(value || '')
        .trim()
        .replace(/\/api\/?$/, '')
        .replace(/\/$/, '');
}

function isBareLocalHttpUrl(value) {
    try {
        const url = new URL(value);
        return (
            url.protocol === 'http:' &&
            (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
            url.port === ''
        );
    } catch {
        return false;
    }
}

const configuredApiUrl = withoutApiSuffix(process.env.NEXT_PUBLIC_API_URL);
const explicitLaravelUrl = withoutApiSuffix(process.env.LARAVEL_APP_URL);
const laravelEnvUrl = withoutApiSuffix(readLaravelEnv('APP_URL'));

// A fresh Laravel .env commonly contains APP_URL=http://localhost while
// `php artisan serve` actually listens on 127.0.0.1:8000. Using the bare
// APP_URL as a Next.js rewrite destination proxies requests to port 80 and
// produces a misleading 500 in the browser. Explicit frontend/Laravel env
// values still win when a different backend origin is intended.
const inferredLaravelUrl = isBareLocalHttpUrl(laravelEnvUrl)
    ? 'http://127.0.0.1:8000'
    : laravelEnvUrl;

const apiOrigin = (
    explicitLaravelUrl ||
    configuredApiUrl ||
    inferredLaravelUrl ||
    'http://127.0.0.1:8000'
).replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,

    // Browser calls stay same-origin (/api/*) while Next proxies them to
    // Laravel. Set LARAVEL_APP_URL when Laravel is not on 127.0.0.1:8000.
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${apiOrigin}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
