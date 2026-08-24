import MeetingsHeader from './(sessions)/MeetingsHeader';
import MeetingsTabs from './(sessions)/MeetingsTabs';
import MeetingsList from './(sessions)/MeetingsList';


const MeetingsPage = () => {
    return (
        <main dir="rtl" className="min-h-screen mt-10 py-12 px-10 bg-[#f7faf8]">
            <MeetingsHeader/>

            <MeetingsTabs />

            <MeetingsList />
        </main>
    );
};

export default MeetingsPage;
