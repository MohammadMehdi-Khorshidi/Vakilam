'use client';

const CapacityBox = ({ color, text, value, border }) => (
    <div
        className={`${border ? 'border border-red-700' : ''} flex items-center justify-center rounded-2xl bg-white py-3`}
    >
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
            <span className="font-regular text-[#8B8B8B]">{text}</span>
            <span className="font-regular text-black">{value}</span>
        </div>
    </div>
);
const HeroChart = () => {
    return (
        <div className="relative w-full max-w-[480px] rounded-[28px] border border-[#eadfca] bg-white p-7 shadow-[0_25px_70px_rgba(13,56,49,0.10)]">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-[#123f37]">
                        پرونده فعال
                    </p>

                    <p className="mt-1 text-xs text-[#8b9996]">
                        وضعیت پیشرفت پرونده
                    </p>
                </div>

                <CapacityBox
                    text=" فعال"
                    color="#0E9A8A"
                    value=""
                />
            </div>

            <div className="relative h-[260px] w-full">
                <div className="absolute top-0 bottom-8 left-0 z-10 flex flex-col justify-between text-[10px] text-[#a2adaa]">
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
                    <line x1="45" y1="15" x2="410" y2="15" stroke="#edf1ef" />

                    <line x1="45" y1="65" x2="410" y2="65" stroke="#edf1ef" />

                    <line x1="45" y1="115" x2="410" y2="115" stroke="#edf1ef" />

                    <line x1="45" y1="165" x2="410" y2="165" stroke="#edf1ef" />

                    <line x1="45" y1="215" x2="410" y2="215" stroke="#edf1ef" />

                    <path
                        d="
              M45 185
              L100 160
              L155 170
              L210 115
              L265 130
              L320 70
              L375 85
              L410 35
              L410 215
              L45 215
              Z
            "
                        fill="#c5a35a"
                        opacity="0.08"
                    />

                    <polyline
                        points="
              45,185
              100,160
              155,170
              210,115
              265,130
              320,70
              375,85
              410,35
            "
                        fill="none"
                        stroke="#c5a35a"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <circle
                        cx="45"
                        cy="185"
                        r="5"
                        fill="white"
                        stroke="#c5a35a"
                        strokeWidth="3"
                    />
                    <circle
                        cx="100"
                        cy="160"
                        r="5"
                        fill="white"
                        stroke="#c5a35a"
                        strokeWidth="3"
                    />
                    <circle
                        cx="155"
                        cy="170"
                        r="5"
                        fill="white"
                        stroke="#c5a35a"
                        strokeWidth="3"
                    />
                    <circle
                        cx="210"
                        cy="115"
                        r="5"
                        fill="white"
                        stroke="#c5a35a"
                        strokeWidth="3"
                    />
                    <circle
                        cx="265"
                        cy="130"
                        r="5"
                        fill="white"
                        stroke="#c5a35a"
                        strokeWidth="3"
                    />
                    <circle
                        cx="320"
                        cy="70"
                        r="5"
                        fill="white"
                        stroke="#c5a35a"
                        strokeWidth="3"
                    />
                    <circle
                        cx="375"
                        cy="85"
                        r="5"
                        fill="white"
                        stroke="#c5a35a"
                        strokeWidth="3"
                    />

                    <circle
                        cx="410"
                        cy="35"
                        r="7"
                        fill="#123f37"
                        stroke="white"
                        strokeWidth="3"
                    />
                </svg>

                <div className="absolute right-0 bottom-[-5px] left-8 flex justify-between text-[10px] text-[#9ba7a4]">
                    <span>شروع</span>
                    <span>بررسی</span>
                    <span>مذاکره</span>
                    <span>قرارداد</span>
                    <span>پیشرفت</span>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#edf1ef] pt-5">
                <div>
                    <p className="text-xs text-[#899793]">
                        سلامت مدیریت پرونده
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#123f37]">
                        روند رو به رشد
                    </p>
                </div>

                <span className="text-2xl font-extrabold text-[#c5a35a]">
                    78٪
                </span>
            </div>
        </div>
    );
};

export default HeroChart;
