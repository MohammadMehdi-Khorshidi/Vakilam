'use client';

import { Vazirmatn } from 'next/font/google';
import ContactForm from '@/components/contact/ContactForm';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ContactPage = () => {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen w-full bg-white text-[#0d302a]`}
        >
            {/* ================= Hero ================= */}
            <section className="relative px-6 pt-12 pb-10 md:px-12 md:pt-16 lg:px-20">
                <div className="mx-auto max-w-7xl">
                    <span className="text-3xl font-bold text-[#c9a96e] md:text-4xl">
                        ارتباط با ما
                    </span>

                    <h1 className="mt-4 text-2xl leading-relaxed font-bold text-[#0d302a] md:text-4xl">
                        در کنار شما،
                        <span className="text-[#c9a96e]">
                            {' '}
                            برای حل مسائل حقوقی
                        </span>
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-8 text-[#0d302a]/70 md:text-base">
                        اگر برای پرونده یا موضوع حقوقی خود نیاز به مشاوره،
                        راهنمایی یا پیگیری دارید، با ما در ارتباط باشید. درخواست
                        شما با دقت بررسی خواهد شد.
                    </p>
                </div>
            </section>

            {/* ================= Form ================= */}
            <section className="relative px-6 pb-20 md:px-12 lg:px-20">
                <ContactForm/>
            </section>

            {/* ================= Bottom Decoration ================= */}
            <div className="relative mt-4 h-32 overflow-hidden bg-[#163f38]">
                {/* خط طلایی */}
                <div className="absolute top-0 right-0 h-1 w-full bg-[#c9a96e]" />

                {/* موج بالا */}
                <div className="absolute -top-10 left-1/2 h-20 w-[120%] -translate-x-1/2 rounded-[50%] bg-[#e8f1ee]" />

                {/* متن */}
                <div className="relative z-10 flex h-full items-end justify-center pb-5">
                    <p className="text-xs text-white/50 md:text-sm">
                        در کنار شما برای حل مسائل حقوقی
                    </p>
                </div>
            </div>
        </main>
    );
};

export default ContactPage;
