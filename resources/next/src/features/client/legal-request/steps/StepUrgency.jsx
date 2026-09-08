import { Vazirmatn } from 'next/font/google';
import ChoiceButton from '../../../../components/common/ChoiceButton';
import { normalizeUrgencyValue, urgencyOptions } from '@/lib/intake';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepUrgency({ data, update, validationError }) {
    const selectedUrgency = normalizeUrgencyValue(data.urgency);

    return (
        <div dir="rtl" className={vazir.className}>
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

            {validationError ? (
                <p className="mt-3 text-sm font-bold text-red-600">
                    {validationError}
                </p>
            ) : null}
        </div>
    );
}
