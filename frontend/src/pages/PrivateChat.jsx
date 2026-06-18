import { useState, useEffect, useRef } from "react";
import {MessageBox} from "../components/index.js";
import { socket } from "../utils/socket.js"
import {useSelector} from "react-redux";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";

export default function PrivateChat() {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {userId} = useParams();

  const targetUserId = userId.toString();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const chatRef = useRef(null);

    const userData = useSelector(state => state.auth.userData);

    useEffect(() => {
      async function checkUser() {
        try {
          if (!targetUserId?.trim()) {
            throw new Error("No userId provided.");
          }

          const response = await api.get(`/api/v1/users/${targetUserId}`);

          console.log("Error message :: PrivateChat() :", response.data.message);
          if (!response.data.success) {
            throw new Error(response.data.message);
          }

          setLoading(false);
        } catch (error) {
          const message = error.response?.data?.message || error.message || "An unexpected error occurred.";
          setError(message);
        }
      };

      checkUser();
    }, [targetUserId]);

    function sendMessagePrivate() {
      if (!message.trim()) return;

      socket.emit("private_message", {
          mode: "private",
          content: message,
          to: userId
      });

      setMessage("");
    }

    const handleKeyDown = (e) => {

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); 
        sendMessagePrivate(); 
      }
    };

    function handleScroll() {

      const container = chatRef.current;
  
      if (!container) return;
  
      // near top
      if (container.scrollTop < 50) {
          loadOlderMessages();
      }
    }

    function handleReceivePrivateMessage(newMessage) {
        setMessages((prev) => [
            ...prev,
            {
                id: newMessage.id,
                from: newMessage.from,
                mode: newMessage.mode,
                content: newMessage.content,
                createdAt: newMessage.createdAt
            }
        ]);

        // auto scroll to bottom on new realtime message
        requestAnimationFrame(() => {
          const container = chatRef.current;

          if (!container) return;

          container.scrollTop = container.scrollHeight;
        });
    }

    function loadInitialMessages() {

      socket.emit(
          "get_private_messages",
          {
            user1: userData._id,
            user2: userId // fill with target user later.
          },
          (response) => {
              if (!response.success) return;

              setMessages(response.messages);

              if (response.messages.length < 15) {
                  setHasMore(false);
              }

              // scroll to bottom initially
              requestAnimationFrame(() => {

                const container = chatRef.current;

                if (!container) return;

                container.scrollTop = container.scrollHeight;
            });
          }
        );
    }

    function loadOlderMessages() {
      if (loadingOlder || !hasMore) return;
    
      setLoadingOlder(true);
    
      const oldestMessage = messages[0];

      const container = chatRef.current;
        if (!container) return;

        const previousHeight = container.scrollHeight;
    
      socket.emit(
        "get_private_messages", {
          cursor: oldestMessage.createdAt,
        },
    
        (response) => {
    
          setLoadingOlder(false);
    
          if (!response.success) return;
    
          if (response.messages.length === 0) {
            setHasMore(false);
            return;
          }
    
          setMessages(prev => [
            ...response.messages,
            ...prev
          ]);

          // preserve scroll position
          requestAnimationFrame(() => {

            const newHeight = container.scrollHeight;

            container.scrollTop =
                newHeight - previousHeight;
        });
        }
      );
    }

    useEffect(() => {

      loadInitialMessages();

      socket.on("private_message", handleReceivePrivateMessage);

      return () => {
          socket.off("private_message", handleReceivePrivateMessage);
      }
    }, [])

    if (error) return <div className="error text-red-500 font-semibold">Error: {error}</div>;
    if (loading) return <div className="loader text-gray-500 font-semibold">Loading...</div>;

    return (
        <div className="h-screen bg-gray-100 flex justify-center items-center">
          <div className="w-full max-w-md h-[700px] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden">
    
            {/* Header */}
            <div className="bg-black text-white p-4 font-semibold text-lg">
              Chat App
            </div>
    
            {/* Messages */}
            <div
              ref={chatRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            >
              {loadingOlder && (
                <div className="text-center text-sm text-gray-500">Loading...</div>
              )}

              {messages.map((msg) => {
                const isMe = String(userData._id) === String(msg.from);

                return (
                  <MessageBox
                    isMe={isMe}
                    key={msg._id}
                    mode={msg.mode}
                    content={msg.content}
                  />
                );
              })}
            </div>
    
            {/* Input Area */}
            <div className="border-t p-3 flex gap-2 items-center bg-white">
              <textarea
                name="message"
                placeholder="Enter your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="
                  flex-1
                  resize-none
                  border
                  rounded-xl
                  px-4
                  py-2
                  outline-none
                  focus:ring-2
                  focus:ring-black
                "
              />
    
              <button
                className="
                  send-btn
                  bg-black
                  text-white
                  p-3
                  rounded-xl
                  hover:opacity-90
                "
                onClick={sendMessagePrivate}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/>
                  <path d="M6 12h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
    )
}