'use client';

import { useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import { Paperclip, Send } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        subject: '',
        contactMethod: '',
        message: '',
        file: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(formData);
    // api
    };

    return (
        <section dir="rtl" className={`${vazir.className} w-full`}>
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 text-right">
                    <span className="text-sm font-semibold text-[#c9a96e]">
                        درخواست مشاوره
                    </span>

                    <h2 className="mt-2 text-2xl font-bold text-[#0d302a] md:text-3xl">
                        چطور می‌توانیم کمکتان کنیم؟
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[#0d302a]/60">
                        اطلاعات خود را وارد کنید تا درخواست شما بررسی شود.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-[24px] border border-[#0d302a]/10 bg-white p-6 shadow-sm md:p-8"
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-semibold text-[#0d302a]"
                            >
                                نام و نام خانوادگی
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="نام و نام خانوادگی خود را وارد کنید"
                                required
                                className="h-12 w-full rounded-xl border border-[#0d302a]/15 bg-[#f8faf9] px-4 text-sm text-[#0d302a] transition outline-none placeholder:text-[#0d302a]/35 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/15"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="phone"
                                className="mb-2 block text-sm font-semibold text-[#0d302a]"
                            >
                                شماره موبایل
                            </label>

                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                                required
                                dir="ltr"
                                className="h-12 w-full rounded-xl border border-[#0d302a]/15 bg-[#f8faf9] px-4 text-sm text-[#0d302a] transition outline-none placeholder:text-[#0d302a]/35 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/15"
                            />
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="subject"
                                className="mb-2 block text-sm font-semibold text-[#0d302a]"
                            >
                                موضوع درخواست
                            </label>

                            <select
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="h-12 w-full rounded-xl border border-[#0d302a]/15 bg-[#f8faf9] px-4 text-sm text-[#0d302a] transition outline-none focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/15"
                            >
                                <option value="">
                                    موضوع درخواست را انتخاب کنید
                                </option>

                                <option value="legal-consultation">
                                    مشاوره حقوقی
                                </option>

                                <option value="case-follow-up">
                                    پیگیری پرونده
                                </option>

                                <option value="contracts">قراردادها</option>

                                <option value="family">مسائل خانواده</option>

                                <option value="criminal">مسائل کیفری</option>

                                <option value="property">مسائل ملکی</option>

                                <option value="other">سایر</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="contactMethod"
                                className="mb-2 block text-sm font-semibold text-[#0d302a]"
                            >
                                روش ارتباط ترجیحی
                            </label>

                            <select
                                id="contactMethod"
                                name="contactMethod"
                                value={formData.contactMethod}
                                onChange={handleChange}
                                required
                                className="h-12 w-full rounded-xl border border-[#0d302a]/15 bg-[#f8faf9] px-4 text-sm text-[#0d302a] transition outline-none focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/15"
                            >
                                <option value="">
                                    روش ارتباط را انتخاب کنید
                                </option>

                                <option value="phone">تماس تلفنی</option>

                                <option value="message">پیام در سایت</option>

                                <option value="whatsapp">واتساپ</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-5">
                        <label
                            htmlFor="message"
                            className="mb-2 block text-sm font-semibold text-[#0d302a]"
                        >
                            شرح مسئله
                        </label>

                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="لطفاً مسئله یا درخواست خود را به طور خلاصه توضیح دهید..."
                            required
                            rows={6}
                            className="w-full resize-none rounded-xl border border-[#0d302a]/15 bg-[#f8faf9] px-4 py-4 text-sm leading-7 text-[#0d302a] transition outline-none placeholder:text-[#0d302a]/35 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/15"
                        />
                    </div>

                    <div className="mt-5">
                        <label
                            htmlFor="file"
                            className="mb-2 block text-sm font-semibold text-[#0d302a]"
                        >
                            پیوست مدارک
                            <span className="mr-1 font-normal text-[#0d302a]/40">
                                (اختیاری)
                            </span>
                        </label>

                        <label
                            htmlFor="file"
                            className="flex min-h-[70px] cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#0d302a]/20 bg-[#f8faf9] px-5 transition hover:border-[#c9a96e] hover:bg-[#f5f8f6]"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c9a96e]/15 text-[#c9a96e]">
                                <Paperclip className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-[#0d302a]">
                                    انتخاب فایل
                                </p>

                                <p className="mt-1 text-xs text-[#0d302a]/45">
                                    مدارک مرتبط با درخواست خود را اضافه کنید
                                </p>
                            </div>

                            <input
                                id="file"
                                name="file"
                                type="file"
                                onChange={handleChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="mt-7 flex justify-start">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#c9a96e] px-7 py-3.5 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                        >
                            ارسال درخواست
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
