import MessagesHeader from '../../../../features/client/messages/MessagesHeader';
import MessagesTabs from '../../../../features/client/messages/MessagesTabs';
import ConversationWorkspace from '../../../../features/conversations/ConversationWorkspace';



const MessagesPage = () => {
    return (
        <main dir="rtl" className="min-h-screen py-10 px-10 mt-12 bg-[#f7faf8]">
            <MessagesHeader />

            <MessagesTabs />

            <ConversationWorkspace />
        </main>
    );
};

export default MessagesPage;
