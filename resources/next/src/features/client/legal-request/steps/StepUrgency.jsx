import { Vazirmatn } from 'next/font/google';
import ChoiceButton from '../../../../components/common/ChoiceButton';
import { normalizeUrgencyValue, urgencyOptions } from '@/lib/intake';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepUrgency({ data, update }) {
    const selectedUrgency = normalizeUrgencyValue(data.urgency);

    return (
        <div dir="rtl" className={vazir.className}>
            <div className="mb-5 rounded-xl bg-[#e8f2ef] p-4 font-bold">
                میزان فوریت مسئله را مشخص کنید.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {urgencyOptions.map((item) => (
                    <ChoiceButton
                        key={item.value}
                        active={selectedUrgency === item.value}
                        onClick={() => update('urgency', item.value)}
                    >
                        {item.label}
                    </ChoiceButton>
                ))}
            </div>
        </div>
    );
}
