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

export default function StepGuide({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <div className="mb-5 rounded-xl bg-[#eff5f3] p-5">
                <div className="mr-auto max-w-2xl rounded-xl border bg-white p-4 text-sm leading-7">
                    <b className="text-[#0b4138]">✦ دستیار وکیلم</b>

                    <p>
                        برداشت اولیه من این است که مسئله شما به «{data.category}
                        » مربوط است. برای اینکه مسیر مناسب را بهتر مشخص کنیم، یک
                        سؤال کوتاه دارم.
                    </p>
                </div>
            </div>

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
        </div>
    );
}
