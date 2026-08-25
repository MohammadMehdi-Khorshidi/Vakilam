'use client';

import { useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import CaseProgress from './(suggestions)/CaseProgress';
import CategorySuggestion from './(suggestions)/CategorySuggestion';
import CategoryGrid from './(suggestions)/CategoryGrid';
import CategoryNotice from './(suggestions)/CategoryNotice';
import CategoryFooter from './(suggestions)/CategoryFooter';
import CaseStepSidebar from './(suggestions)/CaseStepSidebar';



const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const Page = () => {
    const [currentStep, setCurrentStep] = useState(2);
    const [selectedCategory, setSelectedCategory] = useState('حقوق و مالی');

    const handleContinue = () => {
        if (currentStep < 11) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    return (
        <main
            dir="ltr"
            className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
        >
            <div className="mx-auto mt-12 max-w-[1320px] px-5 py-10">
                {/* Breadcrumb */}
                <div className="mb-4 flex items-center justify-end gap-2 text-[#8a9691]">
                    <span>خانه</span>

                    <span>/</span>

                    <span className="font-bold text-[#294e46]">
                        راهنمای تشکیل پرونده
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_200px]">
                    {/* Main */}
                    <div className="min-w-0">
                        <CaseProgress
                            currentStep={currentStep}
                            onBack={handleBack}
                        />

                        <section dir="rtl" className="mt-5">
                            <div className="mb-6">
                                <h1 className="font-extrabold text-[#123f37]">
                                    پیشنهاد وکیل برای دسته‌بندی مسئله
                                </h1>

                                <p className="mt-2 leading-7 text-[#7d8985]">
                                    این تشخیص نمایش است. پیشنهاد را تأیید کنید
                                    یا دسته درست‌تری انتخاب کنید.
                                </p>
                            </div>

                            <div className="rounded-[18px] border border-[#eadfc4] bg-white p-5 shadow-[0_5px_22px_rgba(18,63,55,0.035)]">
                                <CategorySuggestion />

                                <CategoryGrid
                                    selectedCategory={selectedCategory}
                                    onSelect={setSelectedCategory}
                                />

                                <CategoryNotice />

                                <CategoryFooter
                                    currentStep={currentStep}
                                    selectedCategory={selectedCategory}
                                    onContinue={handleContinue}
                                    onBack={handleBack}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:sticky lg:top-6 lg:self-start">
                        <CaseStepSidebar currentStep={currentStep} />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Page;
