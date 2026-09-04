import { redirect } from 'next/navigation';

export default function LegacyOtpPage() {
    redirect('/auth');
}
