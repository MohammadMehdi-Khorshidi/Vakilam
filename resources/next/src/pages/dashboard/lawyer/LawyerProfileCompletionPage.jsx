'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
    BadgeCheck,
    BriefcaseBusiness,
    Check,
    ChevronDown,
    CircleUserRound,
    MapPin,
    PencilLine,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { getLawyerProfile, updateLawyerProfile } from '@/lib/api/lawyer';
import { getCities, getProvinces, getSpecialties } from '@/lib/api/references';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const fa = new Intl.NumberFormat('fa-IR');
const verificationLabels = {
    approved: 'تأییدشده',
    pending: 'در انتظار بررسی',
    rejected: 'ردشده',
    suspended: 'تعلیق‌شده',
};

function SearchSelect({ label, value, options, onChange, placeholder, disabled = false }) {
    const rootRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const close = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const selected = options.find((item) => String(item.id) === String(value));
    const filtered = options.filter((item) =>
        String(item.name || '').toLocaleLowerCase('fa').includes(query.trim().toLocaleLowerCase('fa')),
    );

    return (
        <div ref={rootRef} className="relative">
            {label ? <p className="mb-2 text-xs font-bold text-[#53645f]">{label}</p> : null}
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        setOpen((previous) => !previous);
                        setQuery('');
                    }
                }}
                className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-3 text-right text-sm font-bold outline-none transition ${
                    disabled
                        ? 'cursor-not-allowed border-[#e8ecea] bg-[#f7f9f8] text-[#9aa5a2]'
                        : open
                          ? 'border-[#76a99c] ring-2 ring-[#76a99c]/10'
                          : 'border-[#d9e4e1] text-[#38504b] hover:border-[#b6cec7]'
                }`}
            >
                <span className="truncate">{selected?.name || placeholder}</span>
                <ChevronDown size={16} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open ? (
                <div className="absolute right-0 top-[76px] z-50 w-full overflow-hidden rounded-xl border border-[#d9e4e1] bg-white shadow-[0_14px_35px_rgba(20,60,52,0.14)]">
                    <div className="border-b border-[#edf1ef] p-2">
                        <input
                            autoFocus
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="جستجو..."
                            className="h-10 w-full rounded-lg border border-[#dfe7e4] bg-[#fbfdfc] px-3 text-sm outline-none focus:border-[#9db7b0]"
                        />
                    </div>
                    <div className="max-h-[220px] overflow-y-auto p-1.5">
                        {filtered.length ? filtered.map((option) => {
                            const active = String(option.id) === String(value);
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(option);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                                        active
                                            ? 'bg-[#edf6f2] font-black text-[#17584b]'
                                            : 'text-[#4b5d59] hover:bg-[#f6f9f8]'
                                    }`}
                                >
                                    <span>{option.name}</span>
                                    {active ? <Check size={14} /> : null}
                                </button>
                            );
                        }) : (
                            <p className="px-3 py-6 text-center text-xs text-[#899691]">موردی پیدا نشد.</p>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function CardTitle({ icon: Icon, title, description }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff8f4] text-[#17634f]">
                <Icon size={19} />
            </span>
            <div>
                <h2 className="font-extrabold text-[#173f38]">{title}</h2>
                <p className="mt-1 text-xs leading-6 text-[#7d8a86]">{description}</p>
            </div>
        </div>
    );
}

export default function LawyerProfileCompletionPage() {
    const [profile, setProfile] = useState(null);
    const [specialties, setSpecialties] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [citiesByProvince, setCitiesByProvince] = useState({});
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [basicForm, setBasicForm] = useState({ first_name: '', last_name: '', bio: '', is_available: true });
    const [specialtyRows, setSpecialtyRows] = useState([]);
    const [areaRows, setAreaRows] = useState([]);
    const [newSpecialtyId, setNewSpecialtyId] = useState('');
    const [newAreaProvinceId, setNewAreaProvinceId] = useState('');
    const [newAreaCityId, setNewAreaCityId] = useState('');

    function hydrate(nextProfile) {
        setBasicForm({
            first_name: nextProfile?.first_name ?? '',
            last_name: nextProfile?.last_name ?? '',
            bio: nextProfile?.bio ?? '',
            is_available: Boolean(nextProfile?.is_available),
        });

        setSpecialtyRows((nextProfile?.specialties ?? []).map((item) => ({
            specialty_id: item.specialty_id,
            name: item.name,
            years_experience: item.years_experience == null ? '' : String(item.years_experience),
        })));

        setAreaRows((nextProfile?.service_areas ?? []).map((item) => ({
            id: item.id,
            province_id: item.province?.id,
            province_name: item.province?.name ?? '',
            city_id: item.city?.id ?? null,
            city_name: item.city?.name ?? '',
        })));
    }

    useEffect(() => {
        let mounted = true;
        Promise.all([getLawyerProfile(), getSpecialties(), getProvinces()])
            .then(([profileData, specialtyData, provinceData]) => {
                if (!mounted) return;
                setProfile(profileData);
                setSpecialties(specialtyData ?? []);
                setProvinces(provinceData ?? []);
                hydrate(profileData);
            })
            .catch((e) => {
                if (mounted) setError(e?.message || 'دریافت اطلاعات پروفایل انجام نشد.');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    function begin(key) {
        setBusy(key);
        setError('');
        setNotice('');
    }

    function success(message, updated) {
        setBusy('');
        setError('');
        setNotice(message);
        if (updated) {
            setProfile(updated);
            hydrate(updated);
        }
    }

    function fail(e, fallback) {
        setBusy('');
        setNotice('');
        setError(e?.validationMessages?.[0] || e?.message || fallback);
    }

    async function saveBasic() {
        if (!basicForm.first_name.trim() || !basicForm.last_name.trim()) {
            setNotice('');
            setError('نام و نام خانوادگی را کامل وارد کنید.');
            return;
        }

        begin('basic');
        try {
            const updated = await updateLawyerProfile({
                first_name: basicForm.first_name.trim(),
                last_name: basicForm.last_name.trim(),
                bio: basicForm.bio.trim() || null,
                is_available: basicForm.is_available,
            });
            success('اطلاعات پایه و معرفی حرفه‌ای ذخیره شد.', updated);
        } catch (e) {
            fail(e, 'ذخیره اطلاعات پایه انجام نشد.');
        }
    }

    function addSpecialty() {
        setError('');
        setNotice('');
        if (!newSpecialtyId) return setError('ابتدا یک تخصص را انتخاب کنید.');
        if (specialtyRows.some((row) => String(row.specialty_id) === String(newSpecialtyId))) {
            return setError('این تخصص قبلاً اضافه شده است.');
        }
        const selected = specialties.find((item) => String(item.id) === String(newSpecialtyId));
        setSpecialtyRows((previous) => [...previous, {
            specialty_id: newSpecialtyId,
            name: selected?.name ?? 'تخصص',
            years_experience: '',
        }]);
        setNewSpecialtyId('');
    }

    async function saveSpecialties() {
        if (!specialtyRows.length) {
            setNotice('');
            setError('حداقل یک تخصص اضافه کنید.');
            return;
        }
        begin('specialties');
        try {
            const updated = await updateLawyerProfile({
                specialties: specialtyRows.map((item) => ({
                    specialty_id: item.specialty_id,
                    years_experience: item.years_experience === '' ? null : Number(item.years_experience),
                })),
            });
            success('تخصص‌ها و سابقه مرتبط ذخیره شد.', updated);
        } catch (e) {
            fail(e, 'ذخیره تخصص‌ها انجام نشد.');
        }
    }

    async function chooseProvince(option) {
        setNewAreaProvinceId(option.id);
        setNewAreaCityId('');
        setError('');
        setNotice('');
        if (!citiesByProvince[option.id]) {
            try {
                const cities = await getCities(option.id);
                setCitiesByProvince((previous) => ({ ...previous, [option.id]: cities ?? [] }));
            } catch (e) {
                setError(e?.message || 'دریافت شهرهای استان انجام نشد.');
            }
        }
    }

    function addArea(entireProvince = false) {
        setError('');
        setNotice('');
        if (!newAreaProvinceId) return setError('استان محدوده فعالیت را انتخاب کنید.');
        if (!entireProvince && !newAreaCityId) return setError('یک شهر انتخاب کنید یا «کل استان» را بزنید.');

        const sameProvince = areaRows.filter((row) => String(row.province_id) === String(newAreaProvinceId));
        if (sameProvince.some((row) => row.city_id === null) || (entireProvince && sameProvince.length)) {
            return setError('برای هر استان یا کل استان را انتخاب کنید یا شهرهای مشخص را؛ هر دو حالت با هم مجاز نیست.');
        }

        const duplicate = sameProvince.some((row) =>
            String(row.city_id ?? '') === String(entireProvince ? '' : newAreaCityId),
        );
        if (duplicate) return setError('این محدوده قبلاً اضافه شده است.');

        const province = provinces.find((item) => String(item.id) === String(newAreaProvinceId));
        const city = (citiesByProvince[newAreaProvinceId] ?? []).find((item) => String(item.id) === String(newAreaCityId));

        setAreaRows((previous) => [...previous, {
            id: `local-${Date.now()}-${Math.random()}`,
            province_id: newAreaProvinceId,
            province_name: province?.name ?? 'استان',
            city_id: entireProvince ? null : newAreaCityId,
            city_name: entireProvince ? '' : city?.name ?? 'شهر',
        }]);
        setNewAreaCityId('');
    }

    async function saveAreas() {
        if (!areaRows.length) {
            setNotice('');
            setError('حداقل یک محدوده فعالیت اضافه کنید.');
            return;
        }
        begin('areas');
        try {
            const updated = await updateLawyerProfile({
                service_areas: areaRows.map((item) => ({
                    province_id: Number(item.province_id),
                    city_id: item.city_id == null || item.city_id === '' ? null : Number(item.city_id),
                })),
            });
            success('محدوده‌های فعالیت ذخیره شد.', updated);
        } catch (e) {
            fail(e, 'ذخیره محدوده‌های فعالیت انجام نشد.');
        }
    }

    const completionItems = useMemo(() => [
        { label: 'اطلاعات پایه', complete: Boolean(profile?.first_name && profile?.last_name) },
        { label: 'معرفی حرفه‌ای', complete: Boolean(profile?.bio && profile.bio.trim().length >= 30) },
        { label: 'تخصص‌ها', complete: Boolean(profile?.specialties?.length) },
        { label: 'محدوده فعالیت', complete: Boolean(profile?.service_areas?.length) },
    ], [profile]);

    const completion = Math.round(completionItems.filter((item) => item.complete).length / completionItems.length * 100);
    const availableSpecialties = specialties.filter((item) =>
        !specialtyRows.some((row) => String(row.specialty_id) === String(item.id)),
    );
    const currentCities = citiesByProvince[newAreaProvinceId] ?? [];

    if (loading) {
        return (
            <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f7faf8] px-5 py-6`}>
                <div className="mx-auto max-w-[1180px] rounded-[18px] border border-[#dfe7e3] bg-white py-16 text-center text-[#899691]">
                    در حال دریافت اطلاعات پروفایل...
                </div>
            </main>
        );
    }

    return (
        <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f7faf8]`}>
            <div className="mx-auto max-w-[1180px] px-5 py-7">
                <header className="mb-6">
                    <h1 className="text-2xl font-extrabold text-[#173f38]">پروفایل و تنظیمات</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-[#71817c]">
                        اطلاعات حرفه‌ای، محدوده فعالیت و وضعیت پذیرش پرونده را از این بخش مدیریت کنید.
                    </p>
                </header>

                {error ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
                {notice ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{notice}</div> : null}

                <section className="mb-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
                    <div className="rounded-[18px] border border-[#d6e7e0] bg-[#eff8f4] p-5">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#648078]">میزان تکمیل پروفایل</p>
                                <p className="mt-2 text-3xl font-black text-[#173f38]">{fa.format(completion)}٪</p>
                            </div>
                            <div className="w-full max-w-sm">
                                <div className="h-3 overflow-hidden rounded-full bg-white">
                                    <div className="h-full rounded-full bg-[#17634f] transition-all" style={{ width: `${completion}%` }} />
                                </div>
                                <p className="mt-2 text-xs leading-6 text-[#648078]">
                                    تکمیل اطلاعات باعث می‌شود Matching دقیق‌تر و پروفایل شما برای موکل کامل‌تر باشد.
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-2 sm:grid-cols-2">
                            {completionItems.map((item) => (
                                <div key={item.label} className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2.5 text-xs font-bold text-[#53645f]">
                                    <span className={`flex h-6 w-6 items-center justify-center rounded-full ${item.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {item.complete ? <Check size={14} /> : '!'}
                                    </span>
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[18px] border border-[#eadfbe] bg-[#fffaf0] p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-[#8b7440]">وضعیت حساب حرفه‌ای</p>
                                <h2 className="mt-2 text-lg font-black text-[#5d4c27]">{profile?.full_name || 'وکیل'}</h2>
                            </div>
                            <BadgeCheck className="text-[#b38b38]" />
                        </div>
                        <div className="mt-4 grid gap-3 text-xs text-[#776a48]">
                            <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-3">
                                <span>وضعیت احراز</span>
                                <b>{verificationLabels[profile?.verification_status] || 'نامشخص'}</b>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-3">
                                <span>امتیاز</span>
                                <b>{profile?.average_rating ? `${profile.average_rating} از ۵` : 'هنوز امتیازی ثبت نشده'}</b>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="space-y-5">
                    <section className="rounded-[18px] border border-[#dfe7e3] bg-white p-5 md:p-6">
                        <CardTitle icon={CircleUserRound} title="اطلاعات پایه و معرفی حرفه‌ای" description="نام و معرفی شما در پروفایل عمومی و کارت‌های نمایش وکیل استفاده می‌شود." />
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="text-xs font-bold text-[#53645f]">نام
                                <input value={basicForm.first_name} onChange={(e) => setBasicForm((p) => ({ ...p, first_name: e.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-[#d9e4e1] px-3 text-sm outline-none focus:border-[#76a99c]" />
                            </label>
                            <label className="text-xs font-bold text-[#53645f]">نام خانوادگی
                                <input value={basicForm.last_name} onChange={(e) => setBasicForm((p) => ({ ...p, last_name: e.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-[#d9e4e1] px-3 text-sm outline-none focus:border-[#76a99c]" />
                            </label>
                            <label className="text-xs font-bold text-[#53645f]">شماره موبایل
                                <input value={profile?.phone || ''} readOnly className="mt-2 h-12 w-full cursor-not-allowed rounded-xl border border-[#e4e9e7] bg-[#f7f9f8] px-3 text-sm text-[#85908d]" />
                            </label>
                            <label className="text-xs font-bold text-[#53645f]">شماره پروانه
                                <input value={profile?.license_number || 'ثبت نشده'} readOnly className="mt-2 h-12 w-full cursor-not-allowed rounded-xl border border-[#e4e9e7] bg-[#f7f9f8] px-3 text-sm text-[#85908d]" />
                            </label>
                        </div>

                        <label className="mt-4 block text-xs font-bold text-[#53645f]">معرفی حرفه‌ای
                            <textarea rows={6} maxLength={5000} value={basicForm.bio} onChange={(e) => setBasicForm((p) => ({ ...p, bio: e.target.value }))} placeholder="درباره حوزه‌های کاری، تجربه حرفه‌ای و رویکرد خود برای موکل توضیح دهید..." className="mt-2 w-full resize-y rounded-xl border border-[#d9e4e1] px-3 py-3 text-sm leading-7 outline-none focus:border-[#76a99c]" />
                            <span className="mt-1 block text-left text-[11px] font-normal text-[#899691]">{fa.format(basicForm.bio.length)} / ۵۰۰۰</span>
                        </label>

                        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-[#d6e7e0] bg-[#f4faf7] p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-extrabold text-[#173f38]">پذیرش پرونده جدید</p>
                                <p className="mt-1 text-xs leading-6 text-[#71817c]">اگر غیرفعال باشد، در فهرست Matching وکلا نمایش داده نمی‌شوید.</p>
                            </div>
                            <button type="button" onClick={() => setBasicForm((p) => ({ ...p, is_available: !p.is_available }))} className={`relative h-8 w-14 shrink-0 rounded-full transition ${basicForm.is_available ? 'bg-[#17634f]' : 'bg-[#cbd5d1]'}`}>
                                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${basicForm.is_available ? 'right-7' : 'right-1'}`} />
                            </button>
                        </div>

                        <button type="button" onClick={saveBasic} disabled={busy === 'basic'} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                            <Save size={17} />{busy === 'basic' ? 'در حال ذخیره...' : 'ذخیره اطلاعات پایه'}
                        </button>
                    </section>

                    <section className="rounded-[18px] border border-[#dfe7e3] bg-white p-5 md:p-6">
                        <CardTitle icon={BriefcaseBusiness} title="تخصص‌ها و سابقه مرتبط" description="تخصص‌ها و سابقه هر حوزه مستقیماً روی ترتیب Matching شما اثر می‌گذارد." />
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="min-w-0 flex-1">
                                <SearchSelect label="افزودن تخصص" value={newSpecialtyId} options={availableSpecialties} onChange={(option) => setNewSpecialtyId(option.id)} placeholder="یک تخصص انتخاب کنید" />
                            </div>
                            <button type="button" onClick={addSpecialty} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#bcd2cb] bg-[#f7fbf9] px-5 text-sm font-bold text-[#174c42]">
                                <Plus size={17} />افزودن
                            </button>
                        </div>

                        <div className="mt-5 space-y-3">
                            {specialtyRows.length ? specialtyRows.map((item, index) => (
                                <div key={`${item.specialty_id}-${index}`} className="flex flex-col gap-3 rounded-xl border border-[#e3ebe8] bg-[#fbfdfc] p-4 sm:flex-row sm:items-center">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-extrabold text-[#294e46]">{item.name}</p>
                                        <p className="mt-1 text-xs text-[#85908d]">سابقه مرتبط در این حوزه</p>
                                    </div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-[#53645f]">
                                        <input type="number" min="0" max="100" value={item.years_experience} onChange={(e) => setSpecialtyRows((previous) => previous.map((row, rowIndex) => rowIndex === index ? { ...row, years_experience: e.target.value } : row))} className="h-11 w-24 rounded-xl border border-[#d9e4e1] px-3 text-center outline-none" />سال
                                    </label>
                                    <button type="button" onClick={() => setSpecialtyRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index))} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700"><Trash2 size={16} /></button>
                                </div>
                            )) : (
                                <div className="rounded-xl bg-[#f7faf8] px-4 py-8 text-center text-sm text-[#899691]">هنوز تخصصی اضافه نشده است.</div>
                            )}
                        </div>

                        <button type="button" onClick={saveSpecialties} disabled={busy === 'specialties'} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                            <Save size={17} />{busy === 'specialties' ? 'در حال ذخیره...' : 'ذخیره تخصص‌ها'}
                        </button>
                    </section>

                    <section className="rounded-[18px] border border-[#dfe7e3] bg-white p-5 md:p-6">
                        <CardTitle icon={MapPin} title="محدوده فعالیت" description="می‌توانید کل یک استان یا شهرهای مشخصی از آن را به‌عنوان محدوده کاری انتخاب کنید." />
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                            <SearchSelect label="استان" value={newAreaProvinceId} options={provinces} onChange={chooseProvince} placeholder="استان را انتخاب کنید" />
                            <SearchSelect label="شهر" value={newAreaCityId} options={currentCities} onChange={(option) => { setNewAreaCityId(option.id); setError(''); setNotice(''); }} placeholder={newAreaProvinceId ? 'شهر را انتخاب کنید' : 'ابتدا استان را انتخاب کنید'} disabled={!newAreaProvinceId} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button type="button" onClick={() => addArea(false)} className="inline-flex items-center gap-2 rounded-xl border border-[#bcd2cb] bg-[#f7fbf9] px-4 py-2.5 text-xs font-bold text-[#174c42]"><Plus size={15} />افزودن شهر</button>
                            <button type="button" disabled={!newAreaProvinceId} onClick={() => addArea(true)} className="inline-flex items-center gap-2 rounded-xl border border-[#dfbd6c] bg-[#fffaf0] px-4 py-2.5 text-xs font-bold text-[#7c6126] disabled:opacity-40"><MapPin size={15} />فعالیت در کل استان</button>
                        </div>

                        <div className="mt-5 space-y-3">
                            {areaRows.length ? areaRows.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-[#e3ebe8] bg-[#fbfdfc] p-4">
                                    <div>
                                        <p className="font-extrabold text-[#294e46]">{item.province_name}</p>
                                        <p className="mt-1 text-xs text-[#7f8e89]">{item.city_id === null ? 'کل استان' : item.city_name}</p>
                                    </div>
                                    <button type="button" onClick={() => setAreaRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index))} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700"><Trash2 size={16} /></button>
                                </div>
                            )) : (
                                <div className="rounded-xl bg-[#f7faf8] px-4 py-8 text-center text-sm text-[#899691]">هنوز محدوده فعالیتی ثبت نشده است.</div>
                            )}
                        </div>

                        <button type="button" onClick={saveAreas} disabled={busy === 'areas'} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                            <Save size={17} />{busy === 'areas' ? 'در حال ذخیره...' : 'ذخیره محدوده فعالیت'}
                        </button>
                    </section>

                    <section className="rounded-[18px] border border-[#eadfbe] bg-[#fffaf0] p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#9b772c]"><PencilLine size={18} /></span>
                                <div>
                                    <h2 className="font-extrabold text-[#5d4c27]">تعرفه و زمان‌های مشاوره</h2>
                                    <p className="mt-1 text-xs leading-6 text-[#8b7440]">مدیریت تعرفه‌ها و زمان‌های آزاد در بخش «مشاوره‌های من» انجام می‌شود.</p>
                                </div>
                            </div>
                            <Link href="/lawyer/consultations" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 text-sm font-bold text-white">مدیریت مشاوره‌ها</Link>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
