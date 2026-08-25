'use client';

import {
    ArcElement,
    Chart as ChartJS,
    DoughnutController,
    Tooltip,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, DoughnutController, Tooltip);

const CaseProgressChart = () => {
    const data = {
        labels: ['تکمیل شده', 'باقی مانده'],
        datasets: [
            {
                data: [78, 22],
                backgroundColor: ['#c9a96e', '#557b6d'],
                borderWidth: 0,
                borderRadius: 20,
                spacing: 3,
                cutout: '78%',
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
            duration: 1200,
        },
    };

    return (
        <div className="relative h-[170px] w-[170px]">
            <Doughnut data={data} options={options} />

            {/* Center */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-3xl font-bold">78%</div>

                <div className="mt-1 text-[10px] text-white/65">
                    سلامت مدیریت پرونده
                </div>
            </div>
        </div>
    );
};

export default CaseProgressChart;
