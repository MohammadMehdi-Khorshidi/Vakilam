'use client';

import { AuthAside } from '@/components/ui/auth/AuthAside';
import LoginFlow from '@/features/auth/LoginFlow';

export default function LoginPage() {
    return (
        <div
            className="flex min-h-[calc(100vh-5rem)] flex-col bg-gray-100 md:flex-row"
            dir="rtl"
        >
            <AuthAside />

            <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
                <LoginFlow />
            </div>
        </div>
    );
}
