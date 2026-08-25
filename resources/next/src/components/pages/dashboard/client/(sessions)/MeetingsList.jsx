import { Vazirmatn } from 'next/font/google';

import UpcomingMeeting from './UpcomingMeeting';
import PreviousMeeting from './PreviousMeeting';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const MeetingsList = () => {
    return (
        <section
            className={`${vazirmatn.className} grid grid-cols-1 gap-4 lg:grid-cols-[1.65fr_1fr]`}
            dir="rtl"
        >
            <UpcomingMeeting />

            <PreviousMeeting />
        </section>
    );
};

export default MeetingsList;
