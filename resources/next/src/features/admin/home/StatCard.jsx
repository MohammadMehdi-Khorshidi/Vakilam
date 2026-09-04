import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StatCard({ item }) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className="group relative overflow-hidden rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_6px_18px_rgba(15,52,45,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#c9a34f]/50 hover:shadow-[0_12px_30px_rgba(15,52,45,0.09)]"
        >
            <span className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-[#d3ad58]/10" />

            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-[#74817b]">{item.title}</p>

                    <strong className="mt-2 block text-2xl font-black text-[#123d35]">
                        {item.value.toLocaleString('fa-IR')}
                    </strong>

                    <p className="mt-1 text-sm text-[#8a9691]">
                        {item.description}
                    </p>
                </div>

                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#dfe7e2] bg-[#f8faf8] transition group-hover:border-[#c9a34f]/40 group-hover:bg-[#fbf7ed]">
                    <Icon size={21} strokeWidth={1.8} />
                </span>
            </div>

            <ArrowLeft
                size={17}
                className="absolute bottom-7 left-5 text-[#b08b3e] transition-transform group-hover:-translate-x-1"
            />
        </Link>
    );
}
