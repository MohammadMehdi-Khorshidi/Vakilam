'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { Scale, UserRound, UserRoundCog } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const roles = [
    {
        id: 'client',
        title: 'موکل',
        description: (
            <>
                ثبت مسئله، انتخاب
                <br />
                وکیل و مدیریت همکاری
            </>
        ),
        icon: UserRound,
    },
    {
        id: 'lawyer',
        title: 'وکیل',
        description: (
            <>
                احراز هویت، دریافت
                <br />
                پرونده و مدیریت همکاری
            </>
        ),
        icon: Scale,
    },
    {
        id: 'admin',
        title: 'مدیر سامانه',
        description: (
            <>
                کنترل کاربران، احراز
                <br />
                مالی، امنیت و بازخورد
            </>
        ),
        icon: UserRoundCog,
    },
];

export default function RoleSelection() {
    const router = useRouter();

    const handleRoleSelect = (role) => {
        router.push(`/auth?role=${role}`);
    };

    return (
        <main
            dir="rtl"
            className={`${vazir.className} flex min-h-screen w-full items-center justify-center bg-[#f8faf9] px-5 py-10 sm:px-8`}
        >
            <div className="w-full max-w-[650px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-8 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9">
                <div className="text-center">
                    <h1 className="text-[22px] font-extrabold text-[#123c35] sm:text-[25px]">
                        با چه نقشی وارد می‌شوید؟
                    </h1>

                    <p className="mt-2.5 text-[12px] font-medium text-[#899591] sm:text-[13px]">
                        برای مشاهده مسیر مربوط، یکی از نقش‌ها را انتخاب کنید.
                    </p>
                </div>

                {/* Roles */}
                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {roles.map((role) => {
                        const Icon = role.icon;

                        return (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => handleRoleSelect(role.id)}
                                className="group min-h-[205px] rounded-[15px] border border-[#dfe7e4] bg-white px-4 py-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#c9a96e] hover:bg-[#fafcfb] hover:shadow-[0_10px_25px_rgba(18,60,53,0.07)]"
                            >
                                <div className="mx-auto flex h-[50px] w-[50px] items-center justify-center rounded-[15px] bg-[#f1f7f5] text-[#123c35] transition-all duration-200 group-hover:bg-[#c9a96e]">
                                    <Icon size={23} strokeWidth={1.7} />
                                </div>

                                <h2 className="mt-4 text-[14px] font-extrabold text-[#123c35]">
                                    {role.title}
                                </h2>

                                <p className="mt-2.5 text-[11px] font-medium leading-7 text-[#7c8985]">
                                    {role.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
