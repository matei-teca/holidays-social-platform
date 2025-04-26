import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { getConversations } from "../services/api";
import GroupChatModal from "./GroupChatModal";
import groupIcon from "../assets/group-icon.png";
import defaultAvatar from "../assets/default-avatar.webp";
import "./styles/ChatList.css";

export default function ChatList() {
  const { user } = useAuth();
  const { chatUnreadByConvo } = useNotifications();
  const navigate = useNavigate();

  const [convos, setConvos] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // load conversations
  useEffect(() => {
    getConversations()
      .then((res) => setConvos(res.data))
      .catch((err) => console.error("Failed to load convos", err));
  }, []);

  const handleGroupCreated = (newConvo) => {
    setConvos((prev) => [newConvo, ...prev]);
    navigate(`/chat/${newConvo._id}`);
  };

  return (
    <div className="chat-list">
      <div className="chat-list-actions">
        <Link to="new" className="new-chat-btn">
          + New Chat
        </Link>
        <button
          className="new-group-chat-btn"
          onClick={() => setShowGroupModal(true)}
        >
          + New Group Chat
        </button>
      </div>

      {convos.map((c) => {
        const isGroup = Boolean(c.name);
        const label = isGroup
          ? c.name
          : c.participants.find((p) => p.username !== user.username)?.username ||
            user.username;

        const avatarUrl = isGroup
          ? groupIcon
          : c.participants.find((p) => p.username !== user.username)
              ?.avatarUrl || defaultAvatar;

        const unread = chatUnreadByConvo[c._id] || 0;

        return (
          <Link
            key={c._id}
            to={`/chat/${c._id}`}
            className="chat-list-item"
          >
            <img src={avatarUrl} alt={label} className="avatar-sm" />
            <span className="chat-item-name">
              {label}
              {unread > 0 && <span className="badge">{unread}</span>}
            </span>
          </Link>
        );
      })}

      {showGroupModal && (
        <GroupChatModal
          onClose={() => setShowGroupModal(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}
