import React, { useEffect, useState, useRef } from "react";
import { useParams }                          from "react-router-dom";
import { getConversation, getProfile }        from "../services/api";
import socket                                 from "../socket";
import { useAuth }                            from "../context/AuthContext";
import { useNotifications }                   from "../context/NotificationContext";
import sodium                                 from "libsodium-wrappers";
import {
  publicKey  as myPublicKey,
  privateKey as myPrivateKey
} from "../crypto/keys";
import "./styles/ChatWindow.css";

export default function ChatWindow() {
  const { convoId } = useParams();
  const { user }    = useAuth();
  const { notifications, chatUnreadByConvo, markRead } = useNotifications();

  const [convoMeta, setConvoMeta]       = useState(null);
  const [messages, setMessages]         = useState([]);
  const [text, setText]                 = useState("");
  const [sharedSecret, setSharedSecret] = useState(null);
  const bottomRef                       = useRef();

  // Where to insert the "New Messages" divider
  const dividerIndexRef = useRef(-1);

  // 1️⃣ Initialize: load convo, decrypt, join room, compute divider index, and mark notifications read
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: convo } = await getConversation(convoId);
        if (!mounted) return;
        setConvoMeta(convo);

        // Decrypt or plaintext setup
        let loaded = convo.messages;
        if (!convo.name) {
          // 1:1 chat → E2EE path
          const other = convo.participants.find(p => p.username !== user.username);
          if (other) {
            const { data: profile } = await getProfile(other.username);
            if (profile.publicKey) {
              await sodium.ready;
              const theirPub = sodium.from_base64(profile.publicKey);
              const myPriv   = sodium.from_base64(myPrivateKey);
              const secret   = sodium.crypto_scalarmult(myPriv, theirPub);
              setSharedSecret(secret);
              loaded = convo.messages.map(m => {
                if (m.cipher && m.nonce) {
                  try {
                    const pt = sodium.crypto_secretbox_open_easy(
                      sodium.from_base64(m.cipher),
                      sodium.from_base64(m.nonce),
                      secret
                    );
                    return { ...m, content: sodium.to_string(pt) };
                  } catch {
                    return { ...m, content: "[decrypt failed]" };
                  }
                }
                return m;
              });
            }
          }
        }
        setMessages(loaded);

        // Compute how many unread chat_message notifications exist for this convo
        const unread = (chatUnreadByConvo[convoId] || 0);
        // Divider should go before the first of those unread messages
        dividerIndexRef.current = loaded.length - unread;

        // Mark those notifications as read
        notifications
          .filter(n => n.type === "chat_message" && n.data.convoId === convoId && !n.read)
          .forEach(n => markRead(n._id));

        // Join the Socket.IO room
        socket.emit("joinConvo", convoId);
      } catch (err) {
        console.error("Chat init error:", err);
      }
    }

    init();
    return () => { mounted = false; };
  }, [convoId, user.id]);

  // 2️⃣ Listen for incoming messages
  useEffect(() => {
    const onNew = ({ convoId: id, cipher, nonce, sender, createdAt, content }) => {
      if (id !== convoId) return;
      let txt = content;
      if (sharedSecret && cipher && nonce) {
        try {
          const pt = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(cipher),
            sodium.from_base64(nonce),
            sharedSecret
          );
          txt = sodium.to_string(pt);
        } catch {
          txt = "[decrypt failed]";
        }
      }
      setMessages(prev => [...prev, { _id: Date.now().toString(), sender, content: txt, createdAt }]);
    };

    socket.on("newMessage", onNew);
    return () => socket.off("newMessage", onNew);
  }, [convoId, sharedSecret]);

  // 3️⃣ Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4️⃣ Send message
  const send = async () => {
    const m = text.trim();
    if (!m) return;
    if (!convoMeta?.name && !sharedSecret) {
      if (!window.confirm("⚠️ Sending unencrypted plaintext. Continue?")) return;
    }
    if (convoMeta?.name) {
      socket.emit("sendMessage", { convoId, content: m });
    } else if (sharedSecret) {
      await sodium.ready;
      const nonce  = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const cipher = sodium.crypto_secretbox_easy(
        sodium.from_string(m),
        nonce,
        sharedSecret
      );
      socket.emit("sendMessage", { convoId, cipher: sodium.to_base64(cipher), nonce: sodium.to_base64(nonce) });
    } else {
      socket.emit("sendMessage", { convoId, content: m });
    }
    setText("");
  };

  // Render header (group name or other user)
  const header = () => {
    if (!convoMeta) return "";
    if (convoMeta.name) return convoMeta.name;
    const other = convoMeta.participants.find(p => p.username !== user.username);
    return other?.username || user.username;
  };

  return (
    <div className="chat-window">
      <header className="chat-header">{header()}</header>

      <div className="messages">
        {messages.map((m, idx) => {
          const mine = String(m.sender._id) === user.id;
          const showDivider = idx === dividerIndexRef.current;
          return (
            <React.Fragment key={m._id}>
              {showDivider && (
                <div className="new-messages-divider">New Messages</div>
              )}
              <div className={`msg ${mine ? "mine" : ""}`}>
                <span className="msg-user">{m.sender.username}</span>
                <p className="msg-text">{m.content}</p>
                <span className="msg-time">{new Date(m.createdAt).toLocaleTimeString()}</span>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
