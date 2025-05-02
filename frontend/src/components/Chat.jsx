import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import MessageList from "./MessageList";
import LogoutButton from "./LogoutButton";

const ENDPOINT = import.meta.env.VITE_API_BASE_URL;
const socket = io(ENDPOINT, {
  withCredentials: true,
});

const Chat = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const res = await fetch(`${ENDPOINT}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user info", error);
    }
  };

  const fetchMessages = async (receiver) => {
    if (!user) return;
    setLoading(true);

    try {
      const token = Cookies.get("token");
      const { data } = await axios.get(`${ENDPOINT}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sender: user.username, receiver },
      });

      console.log("Fetched messages:", data);
      setMessages(Array.isArray(data) ? data : data.messages || []);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!user || currentMessage.trim() === "") return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    socket.emit("join", user.username);

    const fetchUsers = async () => {
      try {
        const token = Cookies.get("token");
        const res = await fetch(`${ENDPOINT}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Users data:", data);

        const userList = Array.isArray(data) ? data : data.users;
        const filteredUsers =
          userList?.filter((u) => u.username !== user.username) || [];
        setUsers(filteredUsers);
      } catch (error) {
        console.error("User list fetch failed", error);
      }
    };

    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!user || !currentChat) return;

    const handleReceive = (data) => {
      if (
        (data.sender === currentChat && data.receiver === user.username) ||
        (data.sender === user.username && data.receiver === currentChat)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [user, currentChat]);

  if (!user) {
    return (
      <div className="text-center mt-10 text-lg">Please log in to chat.</div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-full sm:w-1/3 md:w-1/4 bg-gray-100 p-4 overflow-y-auto border-r">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{user.username}</h2>
          <LogoutButton />
        </div>
        <h3 className="font-semibold mb-2">Chats</h3>
        <div className="space-y-2">
          {users.length > 0 ? (
            users.map((u) => (
              <div
                key={u._id || u.username}
                className={`p-2 rounded-md cursor-pointer ${
                  currentChat === u.username ? "bg-green-300" : "bg-white"
                } hover:bg-green-200`}
                onClick={() => fetchMessages(u.username)}
              >
                <strong>{u.username}</strong>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No users available</p>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-full sm:w-2/3 md:w-3/4 p-4 flex flex-col">
        {currentChat ? (
          <>
            <h4 className="font-bold mb-2">Chatting with {currentChat}</h4>
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-md p-2">
              {loading ? (
                <p>Loading messages...</p>
              ) : (
                <MessageList messages={messages} user={user} />
              )}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                className="flex-1 p-2 border rounded-md"
              />
              <button
                onClick={sendMessage}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-10">
            Select a user to start chatting.
          </p>
        )}
      </div>
    </div>
  );
};

export default Chat;
