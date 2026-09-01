'use client';

import { FileText, GraduationCap, Languages, Scale } from 'lucide-react';

export default function ProfileInfo({ profile }) {
    const description =
        profile.description ??
        profile.bio ??
        profile.about ??
        'توضیحات پروفایل توسط وکیل ثبت نشده است.';

    const specialties =
        profile.specialties ?? profile.expertise ?? profile.skills ?? [];

    const education = profile.education ?? profile.degree ?? '—';

    const license =
        profile.license_number ??
        profile.licenseNumber ??
        profile.bar_number ??
        '—';

    const languages = profile.languages ?? 'فارسی';

    const specialtyList = Array.isArray(specialties)
        ? specialties
        : typeof specialties === 'string'
          ? specialties.split(',').map((item) => item.trim())
          : [];

    return (
        <section className="rounded-[22px] border border-[#dfe8e4] bg-white p-6 shadow-[0_8px_30px_rgba(18,63,55,0.04)] lg:p-8">
            <h2 className="text-lg font-extrabold text-[#173f38]">
                اطلاعات حرفه‌ای
            </h2>

            <div className="mt-5">
                <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[#123f37]" />

                    <h3 className="font-extrabold text-[#294e46]">
                        درباره وکیل
                    </h3>
                </div>

                <p className="mt-3 leading-8 text-[#657671]">{description}</p>
            </div>

            <div className="mt-7">
                <div className="flex items-center gap-2">
                    <Scale size={18} className="text-[#123f37]" />

                    <h3 className="font-extrabold text-[#294e46]">تخصص‌ها</h3>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {specialtyList.length > 0 ? (
                        specialtyList.map((item, index) => (
                            <span
                                key={`${item}-${index}`}
                                className="rounded-full bg-[#f1f7f5] px-4 py-2 text-sm font-semibold text-[#52645f]"
                            >
                                {typeof item === 'object'
                                    ? (item.name ?? item.title ?? item.label)
                                    : item}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm text-[#899591]">
                            تخصصی ثبت نشده است.
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoBox
                    icon={<GraduationCap size={18} />}
                    title="تحصیلات"
                    value={education}
                />

                <InfoBox
                    icon={<Scale size={18} />}
                    title="شماره پروانه"
                    value={license}
                />

                <InfoBox
                    icon={<Languages size={18} />}
                    title="زبان"
                    value={languages}
                />
            </div>
        </section>
    );
}

function InfoBox({ icon, title, value }) {
    return (
        <div className="rounded-[14px] bg-[#f5f8f7] p-4">
            <div className="flex items-center gap-2 text-[#71817c]">
                {icon}

                <span className="text-sm font-semibold">{title}</span>
            </div>

            <strong className="mt-3 block text-sm font-extrabold text-[#173f38]">
                {value}
            </strong>
        </div>
    );
}
