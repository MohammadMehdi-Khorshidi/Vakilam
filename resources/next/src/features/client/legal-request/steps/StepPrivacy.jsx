import { LockKeyhole } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';
import ChoiceButton from '../../../../components/common/ChoiceButton';


const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const privacyOptions = [
    'استاندارد — قابل مشاهده برای وکیل منتخب',
    'محرمانه — فقط پس از تأیید من',
    'بسیار حساس — بدون نمایش خودکار مدارک',
];

export default function StepPrivacy({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#e8f2ef] p-4">
                <LockKeyhole />

                <b>سطح دسترسی به اطلاعات پرونده را انتخاب کنید.</b>
            </div>

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
        </div>
    );
}
