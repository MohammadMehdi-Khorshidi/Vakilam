import { Info, Scale } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { paths } from '@/lib/intake';
import ChoiceButton from '../../../../../ui/legalRequest/ChoiceButton';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function StepPath({ data, update }) {
    return (
        <div dir="rtl" className={vazir.className}>
            <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <Info />

                <p className="text-sm">
                    پرونده اولیه آماده است. مسیر ادامه را انتخاب کنید.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {paths.map((path) => (
                    <ChoiceButton
                        key={path.id}
                        active={data.path === path.id}
                        onClick={() => update('path', path.id)}
                    >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f2ef]">
                            <Scale />
                        </span>

                        <span>
                            <b className="block text-lg">{path.title}</b>

                            <small className="mt-2 block leading-6 text-slate-500">
                                {path.text}
                            </small>
                        </span>
                    </ChoiceButton>
                ))}
            </div>
        </div>
    );
}
