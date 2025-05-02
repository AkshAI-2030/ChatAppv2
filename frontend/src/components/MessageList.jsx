const MessageList = ({ messages, user }) => {
  return (
    <div className="flex flex-col space-y-3">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`max-w-xs md:max-w-sm p-3 rounded-xl text-sm ${
            msg.sender === user.username
              ? "self-end bg-green-500 text-white"
              : "self-start bg-gray-200 text-gray-900"
          }`}
        >
          <div>
            <strong>{msg.sender}</strong>: {msg.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
