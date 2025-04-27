// client/src/components/NotificationBell.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { BellIcon } from "@heroicons/react/24/outline";
import "./styles/NotificationBell.css";

export default function NotificationBell() {
  const { notifications, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // count unread items
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleDropdown = () => {
    setOpen((o) => !o);
  };

  const handleNotificationClick = (note) => {
    markRead(note._id);
    setOpen(false);

    if (["new_comment", "event_join", "event_leave", "like"].includes(note.type)) {
      navigate(`/posts/${note.data.postId}`);
    } else if (note.type === "chat_message") {
      navigate(`/chat/${note.data.convoId}`);
    }
  };

  return (
    <div className="notification-bell" ref={ref}>
      <button
        className="notif-btn"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <BellIcon className="bell-icon" />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          {notifications.length > 0 ? (
            notifications.map((note) => (
              <div
                key={note._id}
                className={`notif-item${note.read ? "" : " unread"}`}
                onClick={() => handleNotificationClick(note)}
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
