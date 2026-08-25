import { Vazirmatn } from 'next/font/google';

import ChoiceButton from '../../../../../ui/legalRequest/ChoiceButton';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const urgencyOptions = ['عادی', 'مهم', 'فوری — کمتر از ۲۴ ساعت فرصت دارم'];

export default function StepUrgency({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <div className="mb-5 rounded-xl bg-[#e8f2ef] p-4 font-bold">
                میزان فوریت مسئله را مشخص کنید.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {urgencyOptions.map((item) => (
                    <ChoiceButton
                        key={item}
                        active={data.urgency === item}
                        onClick={() => update('urgency', item)}
                    >
                        {item}
                    </ChoiceButton>
                ))}
            </div>
        </div>
    );
}
