'use client';

import {
    ArcElement,
    Chart as ChartJS,
    DoughnutController,
    Tooltip,
} from 'chart.js';

import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, DoughnutController, Tooltip);

const CaseStatusChart = () => {
    const progress = 78;

    const data = {
        labels: ['تکمیل شده', 'باقی مانده'],
        datasets: [
            {
                data: [progress, 100 - progress],
                backgroundColor: ['#c9a96e', '#dfe9e5'],
                borderWidth: 0,
                borderRadius: 20,
                spacing: 2,
                cutout: '76%',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false,
            },

            tooltip: {
                enabled: true,
                rtl: true,
                textDirection: 'rtl',

                callbacks: {
                    label: (context) => {
                        return `${context.raw}%`;
                    },
                },
            },
        },

        animation: {
            animateRotate: true,
            duration: 1000,
        },
    };

    return (
        <div className="relative h-24 w-24 shrink-0">
            <Doughnut data={data} options={options} />

            {/* Center text */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[#173f37]">
                    {progress}٪
                </span>
            </div>
        </div>
    );
};

export default CaseStatusChart;
