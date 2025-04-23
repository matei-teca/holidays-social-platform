// client/src/pages/ChatLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet }                      from "react-router-dom";
import ChatList                        from "../components/ChatList";
import { getConversations }           from "../services/api";
import "./styles/ChatLayout.css";

const ChatLayout = () => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    getConversations()
      .then((res) => setConversations(res.data))
      .catch((err) => console.error("Failed to load convos", err));
  }, []);

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar">
        {/* Pass convos into ChatList */}
        <ChatList convos={conversations} />
      </aside>
      <main className="chat-main">
        {/* Make convos+setter available to nested routes */}
        <Outlet context={{ conversations, setConversations }} />
      </main>
    </div>
  );
};

export default ChatLayout;
