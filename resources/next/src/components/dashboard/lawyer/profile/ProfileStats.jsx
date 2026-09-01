'use client';

import {
    BriefcaseBusiness,
    CheckCircle2,
    Star,
    ShieldCheck,
} from 'lucide-react';

export default function ProfileStats({ profile }) {
    const trustScore =
        profile.trust_score ?? profile.trustScore ?? profile.trust ?? '—';

    const rating =
        profile.rating ??
        profile.cooperation_score ??
        profile.cooperationScore ??
        '—';

    const cases =
        profile.cases_count ??
        profile.casesCount ??
        profile.reviewed_cases ??
        profile.reviewedCases ??
        '—';

    const experience =
        profile.experience ??
        profile.experience_years ??
        profile.experienceYears ??
        '—';

    const stats = [
        {
            label: 'امتیاز اعتماد',
            value: trustScore,
            icon: ShieldCheck,
        },
        {
            label: 'امتیاز همکاری',
            value: rating,
            icon: Star,
        },
        {
            label: 'پرونده‌ها',
            value: cases,
            icon: CheckCircle2,
        },
        {
            label: 'سابقه حرفه‌ای',
            value: experience,
            icon: BriefcaseBusiness,
        },
    ];

    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.label}
                        className="rounded-[17px] border border-[#e0e8e5] bg-white p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#f0f7f4] text-[#123f37]">
                                <Icon size={19} />
                            </div>

                            <span className="text-sm font-semibold text-[#71817c]">
                                {item.label}
                            </span>
                        </div>

                        <strong className="mt-4 block text-2xl font-extrabold text-[#173f38]">
                            {item.value}
                        </strong>
                    </div>
                );
            })}
        </section>
    );
}
