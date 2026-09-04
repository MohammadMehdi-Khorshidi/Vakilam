'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter } from 'next/navigation';

import { AuthAside } from '@/components/ui/auth/AuthAside';
import RegisterFlow from '@/features/auth/RegisterFlow';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export default function RegisterPage() {
    const router = useRouter();

    return (
        <div
            className={`${vazir.className} flex min-h-screen flex-col bg-gray-100 md:flex-row`}
            dir="rtl"
        >
            <AuthAside />

            <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
                <RegisterFlow
                    onGoToLogin={() => router.push('/login')}
                />
            </div>
        </div>
    );
}
