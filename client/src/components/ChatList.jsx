// client/src/components/ChatList.jsx
import React from "react";
import { Link }       from "react-router-dom";
import { useAuth }    from "../context/AuthContext";
import "./styles/ChatList.css";

export default function ChatList({ convos }) {
  const { user } = useAuth();

  return (
    <div className="chat-list">
      <Link to="new" className="new-chat-btn">
        + New Chat
      </Link>

      {convos.map((c) => {
        const other = c.participants.find((p) => p._id !== user.id);
        const title = other ? other.username : "Group Chat";
        const avatarUrl = other?.avatarUrl || "/assets/group-icon.png";

        return (
          <Link key={c._id} to={`/chat/${c._id}`} className="chat-item">
            <img src={avatarUrl} alt={title} className="avatar-sm" />
            <span className="chat-item-name">{title}</span>
          </Link>
        );
      })}
    </div>
  );
}
