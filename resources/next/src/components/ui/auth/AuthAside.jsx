import Image from 'next/image';
import logoLogin from '@/assets/images/LoginLogo.svg';

export function AuthAside() {
    return (
        <aside
            dir="ltr"
            className="relative hidden min-h-[300px] w-full shrink-0 flex-col overflow-hidden bg-[linear-gradient(150deg,var(--green-800),var(--green-1000))] px-6 py-6 text-white md:min-h-[360px] md:px-10 md:py-8 lg:flex lg:min-h-[calc(100vh-5rem)] lg:w-1/2 lg:p-10"
        >
            <div className="absolute -top-28 -left-20 h-48 w-48 rounded-full border border-[#d8b45a]/40 md:h-64 md:w-64 lg:-top-20 lg:-left-20 lg:h-72 lg:w-72" />

            <div className="absolute -right-48 -bottom-48 h-64 w-64 rounded-full border border-[#d8b45a]/40 md:h-80 md:w-80 lg:h-96 lg:w-96" />

            <div className="relative z-10 flex justify-end">
                <Image
                    src={logoLogin}
                    alt="وکیلم"
                    width={150}
                    height={55}
                    className="h-auto w-[115px] sm:w-[130px] md:w-[145px] lg:w-[200px]"
                />
            </div>

            <div className="relative z-10 mt-auto w-full pt-12 text-right md:pt-16 lg:mb-80 lg:pt-0">
                <div className="ml-auto w-full max-w-[580px]">
                    <h2 className="text-xl leading-[1.8] font-bold sm:text-2xl md:text-3xl lg:text-2xl">
                        محیطی امن برای شروع و مدیریت
                        <br />
                        همکاری حقوقی
                    </h2>

                    <p
                        dir="rtl"
                        className="mt-4 ml-auto max-w-[560px] text-xs leading-7 text-green-100/80 sm:text-sm md:mt-5 md:text-[15px] md:leading-8"
                    >
                        اطلاعات پرونده فقط برای کمک در همان پرونده استفاده
                        می‌شود و برای آموزش عمومی مدل به کار نمی‌رود.
                    </p>
                </div>
            </div>
        </aside>
    );
}
