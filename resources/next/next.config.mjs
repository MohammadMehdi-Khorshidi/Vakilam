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

const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();
const apiOrigin = (
    (process.env.LARAVEL_APP_URL || '').trim() ||
    configuredApiUrl.replace(/\/api\/?$/, '') ||
    readLaravelEnv('APP_URL') ||
    'http://127.0.0.1:8000'
).replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,

    // The frontend runs on :3000 while Laravel is a separate app. Browser API
    // calls use /api/*; proxy them to the Laravel APP_URL so a missing
    // NEXT_PUBLIC_API_URL never turns into a Next.js 404.
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
