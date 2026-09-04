import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const MessagesHeader = () => {
    return (
        <section className={`${vazirmatn.className} mb-7`}>


            <h1 className="text-right font-extrabold tracking-tight text-[#123f37]">
                ارتباط امن با وکیل
            </h1>

            <p className="mt-3 text-right leading-7 text-[#71817c]">
                پیام، تماس صوتی و تصویری داخل وکیلم انجام می‌شود و از ارتباط
                مستقیم خارج از سامانه جلوگیری می‌شود.
            </p>
        </section>
    );
};

export default MessagesHeader;
