import { Vazirmatn } from 'next/font/google';
import ChoiceButton from '../../../../components/common/ChoiceButton';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const privacyOptions = [
    'استاندارد — قابل مشاهده برای وکیل منتخب',
    'محرمانه — فقط پس از تأیید من',
];

export default function StepPrivacy({ data, update, validationError }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <div className="grid gap-3 md:grid-cols-2">
                {privacyOptions.map((item) => (
                    <ChoiceButton
                        key={item}
                        active={data.privacy === item}
                        onClick={() => update('privacy', item)}
                    >
                        {item}
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
