import MessageCard from './MessageCard';

const MessagesList = ({ messages }) => {
    return (
        <section className="rounded-[20px] border border-[#e0e9e5] bg-white p-4 shadow-[0_3px_12px_rgba(11,48,43,0.04)]">
            <div className="flex flex-col gap-2">
                {messages.map((message) => (
                    <MessageCard key={message.id} message={message} />
                ))}
            </div>
        </section>
    );
};

export default MessagesList;
