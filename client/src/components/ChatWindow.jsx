// client/src/components/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams }                          from "react-router-dom";
import { getConversation }                    from "../services/api";
import socket                                 from "../socket";
import { useAuth }                            from "../context/AuthContext";
import "./styles/ChatWindow.css";

export default function ChatWindow() {
  const { convoId } = useParams();
  const { user }    = useAuth(); // contains user.id and user.username

  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState("");
  const bottomRef               = useRef();

  // Fetch conversation history & join the socket room
  useEffect(() => {
    getConversation(convoId)
      .then((res) => setMessages(res.data.messages))
      .catch(console.error);

    socket.emit("joinConvo", convoId);

    const onNewMessage = ({ convoId: id, message }) => {
      if (id === convoId) {
        setMessages((msgs) => [...msgs, message]);
      }
    };
    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("newMessage", onNewMessage);
    };
  }, [convoId]);

  // Auto-scroll down when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a new message
  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    socket.emit("sendMessage", { convoId, content: trimmed });
    setText("");
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((m) => {
          // Determine if this message was sent by the logged-in user
          const mine = String(m.sender._id) === String(user.id);

          return (
            <div key={m._id} className={`msg ${mine ? "mine" : ""}`}>
              <span className="msg-user">{m.sender.username}</span>
              <p className="msg-text">{m.content}</p>
              <span className="msg-time">
                {new Date(m.createdAt).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
