// client/src/components/NotificationBell.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { BellIcon } from "@heroicons/react/24/outline";
import "./styles/NotificationBell.css";

export default function NotificationBell() {
  const { notifications, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // count unread items
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClickBell = () => {
    setOpen((o) => !o);
  };

  const handleClickNotification = (note) => {
    // mark as read & close
    markRead(note._id);
    setOpen(false);

    // navigate based on type
    if (["new_comment", "event_join", "event_leave", "like"].includes(note.type)) {
      navigate(`/posts/${note.data.postId}`);
    } else if (note.type === "chat_message") {
      navigate(`/chat/${note.data.convoId}`);
    }
  };

  return (
    <div className="notification-bell">
      <button
        className="notif-btn"
        onClick={handleClickBell}
        aria-label="Notifications"
      >
        <BellIcon className="bell-icon" />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          {notifications.length > 0 ? (
            notifications.map((note) => (
              <div
                key={note._id}
                className={`notif-item${note.read ? "" : " unread"}`}
                onClick={() => handleClickNotification(note)}
              >
                <p>{note.text}</p>
              </div>
            ))
          ) : (
            <div className="notif-item none">
              <p>No notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
