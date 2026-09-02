'use client';

import { useMemo } from 'react';

const CapacityBox = ({ color, text }) => (
    <div className="flex items-center justify-center rounded-2xl bg-white py-3">
        <div className="flex items-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <circle cx="12" cy="12" r="10" fill={color} opacity="0.15" />

                <circle
                    className="animate-pulse"
                    cx="12"
                    cy="12"
                    r="4"
                    fill={color}
                />
            </svg>

            <span className="text-sm text-[#8B8B8B]">{text}</span>
        </div>
    </div>
);

/*
|--------------------------------------------------------------------------
| مراحل واقعی پرونده
|--------------------------------------------------------------------------
|
| progress از 0 شروع می‌شود.
|
*/

const stages = [
    {
        id: 'start',
        title: 'شروع',
        progress: 0,
        role: 'client',
    },
    {
        id: 'description',
        title: 'شرح مسئله',
        progress: 15,
        role: 'client',
    },
    {
        id: 'documents',
        title: 'مدارک',
        progress: 30,
        role: 'client',
    },
    {
        id: 'review',
        title: 'بررسی',
        progress: 45,
        role: 'lawyer',
    },
    {
        id: 'negotiation',
        title: 'مذاکره',
        progress: 60,
        role: 'lawyer',
    },
    {
        id: 'contract',
        title: 'قرارداد',
        progress: 80,
        role: 'lawyer',
    },
    {
        id: 'cooperation',
        title: 'همکاری',
        progress: 100,
        role: 'both',
    },
];

const HeroChart = () => {
    /*
    |--------------------------------------------------------------------------
    | وضعیت فعلی پرونده
    |--------------------------------------------------------------------------
    |
    | این قسمت بعداً از API می‌آید.
    |
    | فعلاً صفر است تا پرونده از ابتدا شروع شود.
    |
    */

    const caseData = {
        hasActiveCase: true,

        /*
         * مقدار فعلی پیشرفت
         *
         * 0 = تازه شروع شده
         * 15 = شرح مسئله
         * 30 = مدارک
         * 45 = بررسی وکیل
         * 60 = مذاکره
         * 80 = قرارداد
         * 100 = همکاری
         */
        progress: 0,

        status: 'فعال',
    };

    const progress = Math.max(0, Math.min(100, Number(caseData.progress) || 0));

    /*
    |--------------------------------------------------------------------------
    | پیدا کردن مرحله فعلی
    |--------------------------------------------------------------------------
    */

    const currentStage = useMemo(() => {
        let current = stages[0];

        for (const stage of stages) {
            if (progress >= stage.progress) {
                current = stage;
            }
        }

        return current;
    }, [progress]);

    /*
    |--------------------------------------------------------------------------
    | نقاط نمودار
    |--------------------------------------------------------------------------
    */

    const chartPoints = stages.map((stage, index) => {
        const x = 45 + (index / (stages.length - 1)) * 365;

        const y = 215 - (stage.progress / 100) * 180;

        return {
            ...stage,
            x,
            y,
        };
    });

    /*
    |--------------------------------------------------------------------------
    | مسیر خط نمودار
    |--------------------------------------------------------------------------
    */

    const polylinePoints = chartPoints
        .map((point) => `${point.x},${point.y}`)
        .join(' ');

    /*
    |--------------------------------------------------------------------------
    | محدوده زیر نمودار
    |--------------------------------------------------------------------------
    */

    const areaPath = `
        M45 215
        ${chartPoints.map((point) => `L${point.x} ${point.y}`).join(' ')}
        L410 215
        Z
    `;

    /*
    |--------------------------------------------------------------------------
    | موقعیت نقطه فعلی
    |--------------------------------------------------------------------------
    */

    const currentX = 45 + (progress / 100) * 365;

    const currentY = 215 - (progress / 100) * 180;

    return (
        <div className="relative w-full max-w-[480px] rounded-[28px] border border-[#eadfca] bg-white p-7 shadow-[0_25px_70px_rgba(13,56,49,0.10)]">
            {/* Header */}

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-[#123f37]">
                        پرونده فعال
                    </p>

                    <p className="mt-1 text-xs text-[#8b9996]">
                        وضعیت پیشرفت پرونده
                    </p>
                </div>

                <CapacityBox text="فعال" color="#0E9A8A" />
            </div>

            {/* Chart */}

            <div className="relative h-[260px] w-full">
                {/* درصدها */}

                <div className="absolute bottom-8 left-0 top-0 z-10 flex flex-col justify-between text-[10px] text-[#a2adaa]">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                </div>

                <svg
                    viewBox="0 0 420 230"
                    className="absolute inset-0 h-full w-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {/* خطوط */}

                    <line x1="45" y1="15" x2="410" y2="15" stroke="#edf1ef" />

                    <line x1="45" y1="65" x2="410" y2="65" stroke="#edf1ef" />

                    <line x1="45" y1="115" x2="410" y2="115" stroke="#edf1ef" />

                    <line x1="45" y1="165" x2="410" y2="165" stroke="#edf1ef" />

                    <line x1="45" y1="215" x2="410" y2="215" stroke="#edf1ef" />

                    {/* Area */}

                    <path d={areaPath} fill="#c5a35a" opacity="0.08" />

                    {/* خط اصلی */}

                    <polyline
                        points={polylinePoints}
                        fill="none"
                        stroke="#c5a35a"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* نقاط */}

                    {chartPoints.map((point) => {
                        const isPassed = progress >= point.progress;

                        const isCurrent =
                            point.progress === currentStage.progress;

                        return (
                            <circle
                                key={point.id}
                                cx={point.x}
                                cy={point.y}
                                r={isCurrent ? 7 : 5}
                                fill={isPassed ? '#123f37' : 'white'}
                                stroke="#c5a35a"
                                strokeWidth="3"
                            />
                        );
                    })}

                    {/* نقطه فعلی */}

                    <circle
                        cx={currentX}
                        cy={currentY}
                        r="8"
                        fill="#123f37"
                        stroke="white"
                        strokeWidth="3"
                        className="animate-pulse"
                    />
                </svg>

                {/* مراحل */}

                <div className="absolute bottom-[-5px] left-8 right-0 flex justify-between text-[9px] text-[#9ba7a4]">
                    {stages.map((stage) => (
                        <span
                            key={stage.id}
                            className={
                                progress >= stage.progress
                                    ? 'font-bold text-[#123f37]'
                                    : ''
                            }
                        >
                            {stage.title}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer */}

            <div className="mt-8 flex items-center justify-between border-t border-[#edf1ef] pt-5">
                <div>
                    <p className="text-xs text-[#899793]">مرحله فعلی پرونده</p>

                    <p className="mt-1 text-sm font-bold text-[#123f37]">
                        {currentStage.title}
                    </p>
                </div>

                <span className="text-2xl font-extrabold text-[#c5a35a]">
                    {progress}٪
                </span>
            </div>
        </div>
    );
};

export default HeroChart;
