'use client';

import { CheckCircle2, MapPin, Pencil, ShieldCheck } from 'lucide-react';

export default function ProfileHeader({ profile }) {
    const name =
        profile.name ?? profile.full_name ?? profile.fullName ?? 'وکیل';

    const initial = name.charAt(0);

    const title =
        profile.title ??
        profile.profession ??
        profile.job_title ??
        'وکیل پایه یک دادگستری';

    const city = profile.city ?? profile.location ?? profile.province ?? '—';

    const verified =
        profile.verified ??
        profile.is_verified ??
        profile.verification_status === 'verified' ??
        false;

    return (
        <section className="overflow-hidden rounded-[22px] border border-[#dfe8e4] bg-white shadow-[0_8px_30px_rgba(18,63,55,0.05)]">
            <div className="h-3 bg-[#123f37]" />

            <div className="p-6 lg:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-[#123f37] text-3xl font-extrabold text-white">
                            {initial}

                            <span className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#3a9b6e] text-white">
                                <CheckCircle2 size={14} />
                            </span>
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-extrabold text-[#173f38]">
                                    {name}
                                </h1>

                                {verified && (
                                    <span className="flex items-center gap-1 rounded-full border border-[#cce9dc] bg-[#effaf4] px-3 py-1 text-xs font-bold text-[#27805a]">
                                        <ShieldCheck size={14} />
                                        احراز هویت تأییدشده
                                    </span>
                                )}
                            </div>

                            <p className="mt-2 text-sm text-[#71817c]">
                                {title}
                            </p>

                            <div className="mt-2 flex items-center gap-1 text-sm text-[#71817c]">
                                <MapPin size={15} />

                                <span>{city}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-[11px] border border-[#d6e0dc] bg-white px-5 py-3 text-sm font-bold text-[#294e46] transition hover:border-[#123f37] hover:bg-[#f5f8f7]"
                    >
                        <Pencil size={16} />
                        ویرایش پروفایل
                    </button>
                </div>
            </div>
        </section>
    );
}
