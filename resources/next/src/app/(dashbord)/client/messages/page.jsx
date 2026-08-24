import MessagesHeader from '@/components/pages/dashboard/client/(messages)/MessagesHeader';
import MessagesTabs from '@/components/pages/dashboard/client/(messages)/MessagesTabs';
import ContactSidebar from '@/components/pages/dashboard/client/(messages)/ContactSidebar';
import ChatBox from '@/components/pages/dashboard/client/(messages)/ChatBox';



const MessagesPage = () => {
    return (
        <main dir="rtl" className="min-h-screen py-10 px-10 mt-12 bg-[#f7faf8]">
            <MessagesHeader />

            <MessagesTabs />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
                <ContactSidebar />

                <ChatBox />
            </div>
        </main>
    );
};

export default MessagesPage;
