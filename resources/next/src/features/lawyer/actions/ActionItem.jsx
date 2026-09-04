import { ArrowLeft } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const ActionItem = ({ title, time, priority }) => {
    const priorityStyles = {
        زیاد: {
            badge: 'border-[#f3caca] bg-[#fff5f5] text-[#c85a5a]',
            dot: 'bg-[#c94d4d]',
            dotWrapper: 'bg-[#fbe8e8]',
        },
        متوسط: {
            badge: 'border-[#ead39a] bg-[#fffaf0] text-[#a77713]',
            dot: 'bg-[#b98213]',
            dotWrapper: 'bg-[#f8f0dc]',
        },
        کم: {
            badge: 'border-[#d5e3dc] bg-[#f3f8f5] text-[#567b6c]',
            dot: 'bg-[#567b6c]',
            dotWrapper: 'bg-[#e8f0eb]',
        },
    };

    const styles = priorityStyles[priority] || priorityStyles.متوسط;

    return (
        <div dir="ltr"
            className={`${vazir.className} flex items-center justify-between gap-6 border-t border-[#edf0ee] py-6 first:border-t-0`}
        >
            {/* Priority + Action */}
            <div className="flex shrink-0 items-center gap-5">
                <ArrowLeft
                    size={18}
                    strokeWidth={1.7}
                    className="text-[#b58a38]"
                />

                <span
                    className={`rounded-full border px-4 py-1.5 font-semibold ${styles.badge}`}
                >
                    {priority}
                </span>
            </div>

            {/* Content */}
            <div className="flex items-start gap-3 text-right">
                <div
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${styles.dotWrapper}`}
                >
                    <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                </div>

                <div>
                    <h3 className="font-bold text-[#173b34]">{title}</h3>

                    <p className="mt-1 text-[#8b9590]">{time}</p>
                </div>
            </div>
        </div>
    );
};

export default ActionItem;
