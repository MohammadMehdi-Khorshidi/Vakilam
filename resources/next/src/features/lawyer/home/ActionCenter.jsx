import { ArrowLeft } from 'lucide-react';

const actions = [
    {
        title: 'تکمیل اطلاعات حساب بانکی',
        time: 'امروز',
        priority: 'زیاد',
        active: false,
    },
    {
        title: 'پاسخ به پرونده پیشنهادی جدید',
        time: 'تا ۴ ساعت',
        priority: 'زیاد',
        active: true,
    },
    {
        title: 'بارگذاری قرارداد ثبت‌شده',
        time: 'تا فردا',
        priority: 'متوسط',
        active: false,
    },
];

export default function ActionCenter() {
    return (
        <article dir="rtl" className="rounded-[20px] border border-[#dfe5e1] bg-white p-5 shadow-[0_8px_25px_rgba(16,47,41,0.04)] sm:p-6">
            <header className="flex items-center justify-between border-b border-[#e8ece9] pb-4">
                <h2 className="text-lg font-black">مرکز اقدامات وکیل</h2>

                <button
                    type="button"
                    className="text-xs font-bold text-[#195b4f] hover:text-[#0b3c33]"
                >
                    مشاهده همه
                </button>
            </header>

            <div className="mt-4 space-y-2">
                {actions.map((action) => (
                    <button
                        type="button"
                        key={action.title}
                        className={`flex w-full items-center gap-4 rounded-xl px-3 py-4 text-right transition ${
                            action.active
                                ? 'bg-[#f0f6f3] ring-1 ring-[#e0eae5]'
                                : 'hover:bg-[#f7f9f8]'
                        }`}
                    >
                        <span
                            className={`size-2.5 shrink-0 rounded-full ring-4 ${
                                action.priority === 'زیاد'
                                    ? 'bg-[#d46872] ring-[#fae7e9]'
                                    : 'bg-[#b98b36] ring-[#f8efd9]'
                            }`}
                        />

                        <span className="flex-1">
                            <strong className="block text-sm">
                                {action.title}
                            </strong>
                            <small className="mt-1 block text-[#8b9490]">
                                {action.time}
                            </small>
                        </span>

                        <span
                            className={`rounded-full border px-3 py-1 text-[11px] ${
                                action.priority === 'زیاد'
                                    ? 'border-[#f1bbc0] bg-[#fff4f5] text-[#d74f5c]'
                                    : 'border-[#ead49d] bg-[#fffaf0] text-[#9b731f]'
                            }`}
                        >
                            {action.priority}
                        </span>

                        <ArrowLeft size={16} className="text-[#b48a3d]" />
                    </button>
                ))}
            </div>
        </article>
    );
}
