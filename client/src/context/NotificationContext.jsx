import React, { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket";
import { getNotifications, markNotificationRead } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // 1) Fetch on login, clear on logout
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    let mounted = true;
    getNotifications()
      .then((res) => {
        if (mounted) setNotifications(res.data);
      })
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, [user]);

  // 2) Subscribe to live socket notifications
  useEffect(() => {
    if (!user) return;
    const handler = (note) => {
      setNotifications((prev) => [note, ...prev]);
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [user]);

  // Mark a notification read (both locally and server)
  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    markNotificationRead(id).catch(console.error);
  };

  // Derive chat‐message unread counts
  const chatNotifications = notifications.filter((n) => n.type === "chat_message");
  const chatUnreadByConvo = chatNotifications.reduce((map, n) => {
    if (!n.read) {
      const cid = n.data.convoId;
      map[cid] = (map[cid] || 0) + 1;
    }
    return map;
  }, {});
  const totalChatUnread = Object.values(chatUnreadByConvo).reduce((sum, c) => sum + c, 0);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markRead,
        chatUnreadByConvo,
        totalChatUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
