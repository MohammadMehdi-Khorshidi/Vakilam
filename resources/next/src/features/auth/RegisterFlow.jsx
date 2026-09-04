'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/auth/AuthLayout';
import PhoneStep from '@/components/auth/PhoneStep';
import UserInfoStep from '@/components/auth/UserInfoStep';
import LawyerLicenseStep from '@/components/auth/LawyerLicenseStep';

export default function RegisterFlow({ onGoToLogin }) {
    const router = useRouter();

    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        phone: '',
        otp: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        role: '',
        licenseNumber: '',
    });

    useEffect(() => {
        const initialPhone = new URLSearchParams(window.location.search).get(
            'phone',
        );

        if (/^09\d{9}$/.test(initialPhone || '')) {
            setForm((current) => ({ ...current, phone: initialPhone }));
            setStep(2);
        }
    }, []);

    const updateForm = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    /*
     * شماره موبایل کاربر جدید؛ ثبت‌نام بدون OTP ادامه پیدا می‌کند.
     */
    const startRegistration = (phone) => {
        updateForm('phone', phone);
        setStep(2);
    };

    /*
     * مرحله ۳
     * نام + نام خانوادگی + نقش
     */
    const saveUserAndRedirect = (licenseNumber = null) => {
        const userData = {
            phone: form.phone,
            firstName: form.firstName,
            lastName: form.lastName,
            role: form.role,
            licenseNumber,
        };

        localStorage.setItem('demo_auth_user', JSON.stringify(userData));

        if (form.role === 'lawyer') {
            router.push('/lawyer');
            return;
        }

        router.push('/client');
    };

    const handleUserInfo = () => {
        if (form.role === 'lawyer') {
            setStep(3);
            return;
        }

        if (form.role === 'client') {
            saveUserAndRedirect();
        }
    };

    /*
     * مرحله ۴
     * شماره پروانه وکالت
     */
    const handleLicense = (licenseNumber) => {
        saveUserAndRedirect(licenseNumber);
    };

    return (
        <AuthLayout>
            {step === 1 && (
                <PhoneStep
                    phone={form.phone}
                    setPhone={(value) => updateForm('phone', value)}
                    onSubmit={startRegistration}
                    onGoToLogin={onGoToLogin}
                />
            )}

            {step === 2 && (
                <UserInfoStep
                    firstName={form.firstName}
                    setFirstName={(value) => updateForm('firstName', value)}
                    lastName={form.lastName}
                    setLastName={(value) => updateForm('lastName', value)}
                    password={form.password}
                    setPassword={(value) => updateForm('password', value)}
                    confirmPassword={form.confirmPassword}
                    setConfirmPassword={(value) =>
                        updateForm('confirmPassword', value)
                    }
                    role={form.role}
                    setRole={(value) => updateForm('role', value)}
                    onNext={handleUserInfo}
                    onBack={() => setStep(1)}
                />
            )}

            {step === 3 && (
                <LawyerLicenseStep
                    licenseNumber={form.licenseNumber}
                    setLicenseNumber={(value) =>
                        updateForm('licenseNumber', value)
                    }
                    onNext={handleLicense}
                    onBack={() => setStep(2)}
                />
            )}
        </AuthLayout>
    );
}
