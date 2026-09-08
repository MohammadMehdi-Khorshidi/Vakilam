import { Vazirmatn } from 'next/font/google';
import ChoiceButton from '../../../../components/common/ChoiceButton';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const answers = [
    'بله، مدرک دارم.',
    'خیر، هنوز ندارم.',
    'مطمئن نیستم چه مدرکی لازم است.',
];

export default function StepGuide({ data, update, validationError }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <div className="rounded-xl border border-[#d8bb82]/60 bg-[#fffaf0] p-5">
                <span className="text-xs font-bold text-[#936d14]">
                    سؤال ۱ از ۴
                </span>

                <h3 className="mt-2 font-black">
                    آیا مدرک یا مستند مرتبط در اختیار دارید؟
                </h3>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
                {answers.map((answer) => (
                    <ChoiceButton
                        key={answer}
                        active={data.answer === answer}
                        onClick={() => update('answer', answer)}
                    >
                        {answer}
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
