'use client';

import { useParams } from 'next/navigation';

import LawyerDetailsAdminPage from '../../../../../pages/dashboard/admin/LawyerDetailsAdminPage';

export default function Page() {
    const params = useParams();
    return <LawyerDetailsAdminPage lawyerId={params?.lawyerId} />;
}
