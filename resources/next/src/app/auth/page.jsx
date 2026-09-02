'use client';

import { useSearchParams } from 'next/navigation';
import RoleSelection from '../../auth/RoleSelection';
import { AuthAside } from '../../components/ui/auth/AuthAside';
import RegisterUi from '@/components/ui/auth/RegisterUi';

export default function AuthPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    return (
        <div
            className="flex min-h-screen flex-col bg-gray-100 md:flex-row"
            dir="rtl"
        >
            <AuthAside />

            <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
                {!role ? <RoleSelection /> : <RegisterUi />}
            </div>
        </div>
    );
}
