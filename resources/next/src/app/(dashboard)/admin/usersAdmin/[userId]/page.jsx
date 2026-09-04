
import { notFound } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

import { getUserById } from '../../../../../features/admin/users/details/usersDetailsData';
import UserDetailsPage from '../../../../../features/admin/users/details/UserDetailsPage';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export async function generateMetadata({ params }) {
    const { userId } = await params;
    const user = getUserById(userId);

    if (!user) {
        return {
            title: 'کاربر پیدا نشد | وکیلم',
        };
    }

    return {
        title: `${user.name} | مدیریت کاربران وکیلم`,
        description: `مشاهده اطلاعات مدیریتی ${user.name}`,
    };
}

export default async function UserDetailsRoute({ params }) {
    const { userId } = await params;
    const user = getUserById(userId);

    if (!user) {
        notFound();
    }

    return (
        <main
            dir="rtl"
            className={`${vazir.className}  bg-[#f4f7f4] px-4 mt-15 py-8 text-[#102f29] sm:px-6 lg:px-8 xl:px-10`}
        >
            <UserDetailsPage user={user} />
        </main>
    );
}
