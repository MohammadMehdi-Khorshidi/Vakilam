import { Vazirmatn } from 'next/font/google';
import ActionItem from './ActionItem';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const actions = [
    {
        id: 1,
        title: 'تکمیل اطلاعات حساب بانکی',
        time: 'امروز',
        priority: 'زیاد',
    },
    {
        id: 2,
        title: 'پاسخ به پرونده پیشنهادهای جدید',
        time: 'تا ۶ ساعت',
        priority: 'زیاد',
    },
    {
        id: 3,
        title: 'بارگذاری قرارداد ثبت‌شده',
        time: 'تا فردا',
        priority: 'متوسط',
    },
];

const RequiredActions = () => {
    return (
        <section
            className={`${vazir.className} rounded-[20px] border border-[#e1e8e4] bg-white px-5 py-6 shadow-[0_4px_20px_rgba(18,63,55,0.04)] sm:px-7 lg:px-9`}
        >
            {/* Card Header */}
            <div className="border-b border-[#edf0ee] pb-5">
                <h2 className="font-extrabold text-[#173b34]">
                    اقدام‌های ضروری
                </h2>
            </div>

            {/* Actions */}
            <div>
                {actions.map((action) => (
                    <ActionItem
                        key={action.id}
                        title={action.title}
                        time={action.time}
                        priority={action.priority}
                    />
                ))}
            </div>
        </section>
    );
};

export default RequiredActions;
