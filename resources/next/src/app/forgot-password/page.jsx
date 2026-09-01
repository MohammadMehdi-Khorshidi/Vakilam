import { AuthAside } from '../../components/ui/auth/AuthAside';
import ForgotPasswordUi from '../../auth/ForgotPasswordUi';

export default function ForgotPasswordPage() {
    return (
        <div
            className="flex min-h-screen flex-col bg-gray-100 md:flex-row"
            dir="rtl"
        >
            <AuthAside />

            <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
                <ForgotPasswordUi />
            </div>
        </div>
    );
}
