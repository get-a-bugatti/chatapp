import { useState, useEffect, useRef } from "react";
import {MessageBox} from "../components/index.js";
import { socket } from "../utils/socket.js"
import {useSelector} from "react-redux";

export default function GlobalChat() {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const chatRef = useRef(null);

    const userData = useSelector(state => state.auth.userData);

    function sendMessageGlobal() {
      if (!message.trim()) return;

        socket.emit("global_message", {
            mode: "global",
            content: message,
        });

        setMessage("");
    }

    const handleKeyDown = (e) => {

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); 
        sendMessageGlobal(); 
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

    function handleReceiveGlobalMessage(incomingMsg) {

        setMessages((prev) => [
            ...prev,
            {
                id: incomingMsg.id,
                from: incomingMsg.from,
                mode: incomingMsg.mode,
                content: incomingMsg.content,
                createdAt: incomingMsg.createdAt
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
          "get_global_messages",
          {},
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
      const previousHeight = container?.scrollHeight || 0;
    
      socket.emit(
        "get_global_messages", {
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
            if (!container) return;
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - previousHeight;
          });
        }
      );
    }

    useEffect(() => {

      loadInitialMessages();

      socket.on("global_message", handleReceiveGlobalMessage);

      return () => {
          socket.off("global_message", handleReceiveGlobalMessage);
      }
    }, [])

    return (
        <div className="h-screen bg-gray-100 flex justify-center items-center">
          <div className="w-full h-full shadow-xl flex flex-col overflow-hidden">
    
            {/* Header */}
            <div className="bg-black text-white p-4 font-semibold text-lg">
              Global Server
            </div>
    
            {/* Messages */}
            <div
              ref={chatRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {/* {loadingOlder && (
                <div className="text-center text-sm text-gray-500">Loading...</div>
              )} */}

              {messages.map((msg) => {
                const isMe = String(userData._id) === String(msg.from);

                console.log("User isMe Data :",isMe, userData, msg);

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
                  text-black
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
                onClick={sendMessageGlobal}
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