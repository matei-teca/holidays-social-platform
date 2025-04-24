import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import ChatList from "../components/ChatList";
import { getConversations } from "../services/api";
import "./styles/ChatLayout.css";

const ChatLayout = () => {
  const [conversations, setConversations] = useState([]);
  // sidebar is open by default on desktop (>600px)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 600);

  // load convos once
  useEffect(() => {
    getConversations()
      .then((res) => setConversations(res.data))
      .catch((err) => console.error("Failed to load convos", err));
  }, []);

  // automatically open/close sidebar on window resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 600) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="chat-layout">
      <aside className={`chat-sidebar${sidebarOpen ? " open" : ""}`}>
        <ChatList convos={conversations} />
      </aside>

      {/* ☰ toggle: now comes after the aside so sibling‐selector works */}
      <button
        className="sidebar-toggle"
        aria-label="Toggle chat sidebar"
        onClick={() => setSidebarOpen((o) => !o)}
      >
        ☰
      </button>

      <main className="chat-main">
        <Outlet context={{ conversations, setConversations }} />
      </main>
    </div>
  );
};

export default ChatLayout;
