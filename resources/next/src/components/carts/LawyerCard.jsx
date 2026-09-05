import { CheckCircle2, MapPin, Star } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

export default function LawyerCard({ lawyer, onProfileClick }) {
    const name = lawyer.full_name || lawyer.name || 'وکیل وکیلم';
    const initial = Array.from(name)[0] || 'و';
    const specialties = lawyer.specialties || [];
    const serviceAreas = lawyer.service_areas || [];
    const locations = serviceAreas
        .map((area) => area.city?.name || area.province?.name)
        .filter(Boolean);

    return (
        <article
            dir="rtl"
            className={`${vazirmatn.className} rounded-[18px] border border-[#dfbd6c] bg-white p-5 shadow-[0_5px_20px_rgba(18,63,55,0.04)]`}
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] bg-[#123f37] font-extrabold text-white">
                        {initial}
                        <span className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#3a9b6e]">
                            <CheckCircle2 size={12} />
                        </span>
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-extrabold text-[#173f38]">{name}</h2>
                            <span className="rounded-full bg-[#effaf4] px-3 py-1 text-xs font-bold text-[#27805a]">
                                احراز هویت تأییدشده
                            </span>
                        </div>

                        {lawyer.bio && (
                            <p className="mt-3 max-w-3xl leading-7 text-[#62736e]">
                                {lawyer.bio}
                            </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#52645f]">
                            {lawyer.average_rating !== null &&
                                lawyer.average_rating !== undefined && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f0e5] px-3 py-1.5">
                                        <Star size={14} />
                                        {lawyer.average_rating} از{' '}
                                        {lawyer.rating_count || 0} نظر
                                    </span>
                                )}
                            {locations.length > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f7f5] px-3 py-1.5">
                                    <MapPin size={14} />
                                    {locations.join('، ')}
                                </span>
                            )}
                            {specialties.map((item) => (
                                <span
                                    key={item.id || item.specialty?.id || item.name}
                                    className="rounded-full bg-[#f2f7f5] px-3 py-1.5"
                                >
                                    {item.specialty?.name || item.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onProfileClick}
                    className="shrink-0 rounded-[11px] bg-[#123f37] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0d302a]"
                >
                    مشاهده پروفایل
                </button>
            </div>
        </article>
    );
}
